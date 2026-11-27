import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import common from './common.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route and OAuth variables
const router = express.Router();
const clientId = config.clientId;
const clientSecret = config.clientSecret;
const redirectURI = encodeURI('http://localhost:3000/oauth-callback');
const scopes = encodeURIComponent('openid email profile offline_access');

// Crypto variables
const password = 'setec-astronomy';
const key = crypto.scryptSync(password, 'salt', 24);
const iv = crypto.randomBytes(16);

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

router.get('/logout', (req, res, next) => {
  removeTokens(res);
  req.session.destroy();
  res.redirect(`${config.authServerUrl}/oauth2/logout?client_id=${config.clientId}`);   // end FusionAuth session
});

router.post('/refresh', async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.sendStatus(403);
  try {
    const refreshedTokens = await common.refreshJWTs(refreshToken);
    const newAccessToken = refreshedTokens.accessToken;
    const newIdToken = refreshedTokens.idToken;
    console.log("updating our cookies");
    res.cookie('access_token', newAccessToken, { httpOnly: true }); // use 'secure: true' when running over https
    res.cookie('id_token', newIdToken); // Not httpOnly or secure
    return res.sendStatus(200);
  }
  catch (error) {
    console.log("unable to refresh");
    return res.sendStatus(403);
  }
});

router.get('/tokencheck', async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const active = await common.validateToken(accessToken, config.clientId, config.clientId, config.issuer);
  res.send(`<h1>FusionAuth Example</h1><p>Token state: ${active}</p>`);
});

// :snippet-start: loginRoute
router.get('/login', (req, res, next) => {
  const state = generateAndSaveState(req, res);
  const codeChallenge = generateAndSaveCodeChallenge(req, res);
  const nonce = generateAndSaveNonce(req, res);
  res.redirect(302,
    config.authServerUrl + '/oauth2/authorize?' +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectURI}&` +
    `state=${state}&` +
    `response_type=code&` +
    `scope=${scopes}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256&` +
    `nonce=${nonce}`);
});
// :snippet-end:

router.get('/oauth-callback', async (req, res, next) => {
  // Verify the state
  const reqState = req.query.state;
  const state = restoreState(req, res);
  if (reqState !== state) return res.redirect('/', 302); // Start over
  const code = req.query.code;
  const codeVerifier = restoreCodeVerifier(req, res);
  const nonce = restoreNonce(req, res);

  // POST request to Token endpoint
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);
  form.append('code', code);
  form.append('code_verifier', codeVerifier);
  form.append('grant_type', 'authorization_code');
  form.append('redirect_uri', redirectURI);
  try {
    const response = await fetch(config.authServerUrl + '/oauth2/token', { method: 'POST', body: form });
    if (!response.ok) throw new Error('token exchange failed: ' + response.status);
    const data = await response.json();
    const accessToken = data.access_token;
    const idToken = data.id_token;
    const refreshToken = data.refresh_token;

    // Parse and verify the ID token (it's a JWT and once verified we can just store the body)
    if (idToken) {
      let user = await common.parseJWT(idToken, nonce);
      if (!user) {
        console.log('Nonce is bad. It should be ' + nonce + ' but was ' + idToken.nonce);
        return res.redirect(302, "/"); // Start over
      }
      // TODO store user object in localstorage?
    }

    // Since the different OAuth modes handle the tokens differently, we are going to
    // put a placeholder function here. We'll discuss this function in the following
    // sections
    handleTokens(accessToken, idToken, refreshToken, res);
  }
  catch (err) {
    console.log("in error2");
    console.error(JSON.stringify(err));
  }
});

// Helper method for Base 64 encoding that is URL safe
function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256')
    .update(buffer)
    .digest();
}

function encrypt(value) {
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted + ':' + iv.toString('hex');
}

function decrypt(value) {
  const parts = value.split(':');
  const cipherText = parts[0];
  const iv = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateAndSaveState(req, res) {
  const state = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_state', encrypt(state), { httpOnly: true }); // use 'secure: true' when running over https
  return state;
}

function generateAndSaveCodeChallenge(req, res) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_code_verifier', encrypt(codeVerifier), { httpOnly: true }); // use 'secure: true' when running over https
  return base64URLEncode(sha256(codeVerifier));
}

function restoreState(req, res) {
  const value = decrypt(req.cookies.oauth_state);
  res.clearCookie('oauth_state');
  return value;
}

function restoreCodeVerifier(req, res) {
  const value = decrypt(req.cookies.oauth_code_verifier);
  res.clearCookie('oauth_code_verifier');
  return value;
}

function restoreNonce(req, res) {
  const value = decrypt(req.cookies.oauth_nonce);
  res.clearCookie('oauth_nonce');
  return value;
}

function generateAndSaveNonce(req, res) {
  const nonce = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_nonce', encrypt(nonce), { httpOnly: true }); // use 'secure: true' when running over https
  return nonce;
}

function handleTokens(accessToken, idToken, refreshToken, res) {
  // Write the tokens as cookies
  res.cookie('access_token', accessToken, { httpOnly: true }); // use 'secure: true' when running over https
  res.cookie('id_token', idToken); // Not httpOnly or secure
  res.cookie('refresh_token', refreshToken, { httpOnly: true }); // use 'secure: true' when running over https

  // Call the third-party API
/* this is fake, but you could replace with a real one
  const friendsResponse = await fetch('https://api.third-party-provider.com/profile/friends', { method: 'POST', body: form, headers: { 'Authorization' : 'Bearer '+accessToken } });
  if (friendsResponse.status == 200) {
    const json = await friendsResponse.json();
    req.session.friends = json.friends;

    // Optionally store the friends list in our database
    storeFriends(req, json.friends);
  }
*/

  // Redirect to the To-do list
  res.redirect(302, '/todos');
}

function removeTokens(res) {
  // remove the token cookies
  res.clearCookie('access_token');
  res.clearCookie('id_token');
  res.clearCookie('refresh_token');
}

export default router;

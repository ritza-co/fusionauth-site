import axios from 'axios';
import FormData from 'form-data';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import config from './config.js';

const jwksUri = config.authServerUrl + '/.well-known/jwks.json';
const jwksClient = createRemoteJWKSet(new URL(jwksUri));

const common = {};

common.parseJWT = async (unverifiedToken, nonce) => {
  try {
    const { payload } = await jwtVerify(unverifiedToken, jwksClient, { audience: config.clientId, issuer: config.issuer });
    if (nonce) {
      if (nonce !== payload.nonce) {
        console.log("nonce doesn't match " + nonce + ", " + payload.nonce);
        return null;
      }
    }
    return payload;
  } catch(err) {
    console.log(err);
    throw err;
  }
};

common.refreshJWTs = async (refreshToken) => {
  console.log("refreshing.");
  // POST refresh request to Token endpoint
  const form = new FormData();
  form.append('client_id', config.clientId);
  form.append('grant_type', 'refresh_token');
  form.append('refresh_token', refreshToken);
  const authValue = 'Basic ' + Buffer.from(config.clientId + ":" + config.clientSecret).toString('base64');
  const response = await axios.post(config.authServerUrl + '/oauth2/token', form, {
    headers: {
      'Authorization': authValue,
      ...form.getHeaders()
    }
  });

  const accessToken = response.data.access_token;
  const idToken = response.data.id_token;
  const refreshedTokens = {};
  refreshedTokens.accessToken = accessToken;
  refreshedTokens.idToken = idToken;
  return refreshedTokens;
};

common.validateToken = async function (accessToken, clientId, expectedAud, expectedIss) {
  const form = new FormData();
  form.append('token', accessToken);
  form.append('client_id', clientId); // FusionAuth requires this for authentication

  try {
    const response = await axios.post(config.authServerUrl + '/oauth2/introspect', form, { headers: form.getHeaders() });
    if (response.status === 200) {
      const data = response.data;
      if (!data.active) {
        return false; // if not active, we don't get any other claims
      }
      return expectedAud === data.aud && expectedIss === data.iss;
    }
  } catch (err) {
    console.log(err);
  }

  return false;
};

common.retrieveUser = async function (accessToken) {
  const response = await axios.get(config.authServerUrl + '/oauth2/userinfo', { headers: { 'Authorization': 'Bearer ' + accessToken } });
  try {
    if (response.status === 200) {
      return response.data;
    }

    return null;
  } catch (err) {
    console.log(err);
  }
  return null;
};

common.todos = [];

common.completeTodo = (id) => {
  const todosToUpdate = common.getTodos();
  todosToUpdate.forEach((oneTodo) => {
    if (oneTodo.id === id) {
      oneTodo.done = true;
    }
  });
};

common.uncompleteTodo = (id) => {
  common.getTodos().forEach((oneTodo) => {
    if (oneTodo.id === id) oneTodo.done = false;
  });
};

common.getTodo = (id) => {
  const todosToUpdate = common.getTodos();
  todosToUpdate.forEach((oneTodo) => {
    if (oneTodo.id === id) {
      return oneTodo;
    }
  });

  return null;
};

common.getTodos = () => {
  if (common.todos.length === 0) {
    // pull from the database in real world
    common.todos.push({ 'id': 1, 'task': 'Get milk', 'done': true });
    common.todos.push({ 'id': 2, 'task': 'Read OAuth guide', 'done': false });
  }
  return common.todos;
};

common.authorizationCheck = async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return false;
  }

  try {
    await common.parseJWT(accessToken);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default common;

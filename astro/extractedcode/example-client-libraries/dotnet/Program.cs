using System;
using io.fusionauth;
using io.fusionauth.domain;
using io.fusionauth.domain.api;
using io.fusionauth.domain.api.user;
using System.Collections.Generic;
using Newtonsoft.Json;
using io.fusionauth.domain.oauth2;
using io.fusionauth.domain.search;

namespace Setup
{
    class Program
    {
        private static readonly String applicationName = ".NET FusionAuth Application";
        private static readonly String apiKey = Environment.GetEnvironmentVariable("fusionauth_api_key");
        private static readonly String fusionauthURL = "http://localhost:9011";
        private static readonly String authorizedRedirectURL = "https://localhost:5001/callback";
        private static readonly String logoutURL = "https://localhost:5001/";
        private static readonly String applicationId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
        private static readonly String clientSecret = "change-this-in-production-to-be-a-real-secret";

        static void Main(string[] args)
        {

            if (String.IsNullOrEmpty(apiKey))
            {
                throw new ArgumentException("apiKey", "The API key must be set in the environment variable `fusionauth_api_key`");
            }

            FusionAuthSyncClient client = new FusionAuthSyncClient(apiKey, fusionauthURL);

            //set the issuer up correctly
            ClientResponse<TenantResponse> retrieveTenantsResponse = client.RetrieveTenants();
            if (!retrieveTenantsResponse.WasSuccessful())
            {
                throw new Exception("couldn't find tenant");
            }

            //should be only one
            Tenant tenant = retrieveTenantsResponse.successResponse.tenants[0];

            Dictionary<String, Object> issuerUpdateMap = new Dictionary<String, Object>();
            Dictionary<String, Object> tenantMap = new Dictionary<String, Object>();
            tenantMap["issuer"] = fusionauthURL;
            issuerUpdateMap["tenant"] = tenantMap;

            ClientResponse<TenantResponse> patchTenantResponse = client.PatchTenant(tenant.id, issuerUpdateMap);
            if (!patchTenantResponse.WasSuccessful())
            {
                throw new Exception("couldn't update tenant");
            }

            // generate RSA keypair
            System.Guid rsaKeyId = System.Guid.Parse("356a6624-b33c-471a-b707-48bbfcfbc593");

            Key rsaKey = new Key();

            rsaKey.algorithm = KeyAlgorithm.RS256;
            rsaKey.name = ".NET FusionAuth Application";
            rsaKey.length = 2048;
            KeyRequest keyRequest = new KeyRequest();
            keyRequest.key = rsaKey;
            ClientResponse<KeyResponse> keyResponse = client.GenerateKey(rsaKeyId, keyRequest);
            if (!keyResponse.WasSuccessful())
            {
                throw new Exception("couldn't create RSA key");
            }

            // create application
            Application application = new Application();
            application.oauthConfiguration = new OAuth2Configuration();
            application.oauthConfiguration.authorizedRedirectURLs = new List<string>();
            application.oauthConfiguration.authorizedRedirectURLs.Add(authorizedRedirectURL);
            application.oauthConfiguration.requireRegistration = true;

            application.oauthConfiguration.enabledGrants = new List<GrantType>
                { GrantType.authorization_code, GrantType.refresh_token };
            application.oauthConfiguration.logoutURL = logoutURL;
            application.oauthConfiguration.proofKeyForCodeExchangePolicy = ProofKeyForCodeExchangePolicy.Required;
            application.name = applicationName;

            // assign key from above to sign our tokens. This needs to be asymmetric
            application.jwtConfiguration = new JWTConfiguration();
            application.jwtConfiguration.enabled = true;
            application.jwtConfiguration.accessTokenKeyId = rsaKeyId;
            application.jwtConfiguration.idTokenKeyId = rsaKeyId;

            Guid clientId = Guid.Parse(applicationId);
            

            application.oauthConfiguration.clientSecret = clientSecret;
            ApplicationRequest applicationRequest = new ApplicationRequest();
            applicationRequest.application = application;
            ClientResponse<ApplicationResponse> applicationResponse =
                client.CreateApplication(clientId, applicationRequest);
            if (!applicationResponse.WasSuccessful())
            {
                throw new Exception("couldn't create application");
            }

            // register user, there should be only one, so grab the first
            SearchRequest searchRequest = new SearchRequest();
            UserSearchCriteria userSearchCriteria = new UserSearchCriteria();
            userSearchCriteria.queryString = "*";
            searchRequest.search = userSearchCriteria;

            ClientResponse<SearchResponse> userSearchResponse = client.SearchUsersByQuery(searchRequest);
            if (!userSearchResponse.WasSuccessful())
            {
                throw new Exception("couldn't find users");
            }

            User myUser = userSearchResponse.successResponse.users[0];

            // patch the user to make sure they have a full name, otherwise OIDC has issues
            Dictionary<String, Object> fullNameUpdateMap = new Dictionary<String, Object>();
            Dictionary<String, Object> userMap = new Dictionary<String, Object>();
            userMap["fullName"] = myUser.firstName + " " + myUser.lastName;
            fullNameUpdateMap["user"] = userMap;
            ClientResponse<UserResponse> patchUserResponse = client.PatchUser(myUser.id, fullNameUpdateMap);
            if (!patchUserResponse.WasSuccessful())
            {
                throw new Exception("couldn't update user");
            }

            // now register the user
            UserRegistration registration = new UserRegistration();
            registration.applicationId = clientId;

            // otherwise we try to create the user as well as add the registration
            User nullBecauseWeHaveExistingUser = null;

            RegistrationRequest registrationRequest = new RegistrationRequest();
            registrationRequest.user = nullBecauseWeHaveExistingUser;
            registrationRequest.registration = registration;
            ClientResponse<RegistrationResponse> registrationResponse = client.Register(myUser.id, registrationRequest);
            if (!registrationResponse.WasSuccessful())
            {
                throw new Exception("couldn't register user");
            }
        }
    }
}
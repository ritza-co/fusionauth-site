package io.fusionauth.example;

import java.util.HashMap;

import java.util.UUID;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.IdentityProviderRequest;
import io.fusionauth.domain.api.IdentityProviderResponse;
import io.fusionauth.domain.provider.TwitterApplicationConfiguration;
import io.fusionauth.domain.provider.TwitterIdentityProvider;

public class AddTwitterOAuth {

  public static void main(String[] args) {
    final String apiKey = System.getProperty("fusionauth.api.key");
    final FusionAuthClient client = new FusionAuthClient(apiKey, "http://localhost:9011");

    // create a twitter provider
    UUID clientId = UUID.fromString(Setup.APPLICATION_ID);
    TwitterIdentityProvider twitterIdentityProvider = new TwitterIdentityProvider();
    twitterIdentityProvider.enabled = true;
    twitterIdentityProvider.buttonText = "Login With Twitter";
    twitterIdentityProvider.consumerKey = "change-this-in-production-to-be-a-real-twitter-key";
    twitterIdentityProvider.consumerSecret = "change-this-in-production-to-be-a-real-twitter-secret";

    // enable it for our application
    twitterIdentityProvider.applicationConfiguration = new HashMap<UUID, TwitterApplicationConfiguration>();
    TwitterApplicationConfiguration twitterApplicationConfiguration = new TwitterApplicationConfiguration();
    twitterApplicationConfiguration.enabled = true;
    twitterIdentityProvider.applicationConfiguration.put(clientId, twitterApplicationConfiguration);

    IdentityProviderRequest twitterIdentityProviderRequest = new IdentityProviderRequest(twitterIdentityProvider);
		
    ClientResponse<IdentityProviderResponse, Errors> identityProviderResponse = client.createIdentityProvider(null, twitterIdentityProviderRequest);
    if (!identityProviderResponse.wasSuccessful()) {
      throw new RuntimeException("couldn't add twitter login");
    }
  }
}

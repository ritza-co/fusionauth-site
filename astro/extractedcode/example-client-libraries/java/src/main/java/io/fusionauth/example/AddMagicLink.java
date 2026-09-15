package io.fusionauth.example;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.ApplicationResponse;

public class AddMagicLink {

  public static void main(String[] args) {
    final String apiKey = System.getProperty("fusionauth.api.key");
    final FusionAuthClient client = new FusionAuthClient(apiKey, "http://localhost:9011");

    // enable magic links
    UUID clientId = UUID.fromString(Setup.APPLICATION_ID);

    Map<String, Object> applicationMap = new HashMap<String, Object>();
    Map<String, Object> passwordlessConfigurationMap = new HashMap<String, Object>();
    Map<String, Object> enableMagicLinkUpdateMap = new HashMap<String, Object>();

    passwordlessConfigurationMap.put("enabled",true);
    applicationMap.put("passwordlessConfiguration", passwordlessConfigurationMap);
    enableMagicLinkUpdateMap.put("application", applicationMap);

    ClientResponse<ApplicationResponse, Errors> applicationResponse = client.patchApplication(clientId, enableMagicLinkUpdateMap);
    if (!applicationResponse.wasSuccessful()) {
      throw new RuntimeException("couldn't update application");
    }
  }
}

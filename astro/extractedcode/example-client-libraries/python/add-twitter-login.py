from fusionauth.fusionauth_client import FusionAuthClient
import os
import sys

APPLICATION_ID = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";

#  You must supply your API key 
api_key_name = 'fusionauth_api_key'
api_key = os.getenv(api_key_name)
if not api_key:
  sys.exit("please set api key in the '" + api_key_name + "' environment variable")

client = FusionAuthClient(api_key, 'http://localhost:9011')

twitter_identity_provider = {}
twitter_identity_provider["enabled"] = True
twitter_identity_provider["type"] = "Twitter"
twitter_identity_provider["buttonText"] = "Login With Twitter"
twitter_identity_provider["consumerKey"] = "change-this-in-production-to-be-a-real-twitter-key"
twitter_identity_provider["consumerSecret"] = "change-this-in-production-to-be-a-real-twitter-secret"
twitter_identity_provider["applicationConfiguration"] = {}
twitter_identity_provider["applicationConfiguration"][APPLICATION_ID] = {"enabled":True}


client_response = client.create_identity_provider({"identityProvider": twitter_identity_provider})
if not client_response.was_successful():
  sys.exit("couldn't add twitter login "+ str(client_response.error_response))


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

client_response = client.patch_application(APPLICATION_ID, {"application": {"passwordlessConfiguration":{"enabled":True}}})
if not client_response.was_successful():
  sys.exit("couldn't update application "+ str(client_response.error_response))

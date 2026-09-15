require 'fusionauth/fusionauth_client'

APPLICATION_ID = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
RSA_KEY_ID = "356a6624-b33c-471a-b707-48bbfcfbc593"

#  You must supply your API key as an envt var
api_key_name = 'fusionauth_api_key'
api_key = ENV[api_key_name]

unless api_key
  puts "please set api key in the '" + api_key_name.to_s + "' environment variable"
  exit 1
end

client = FusionAuth::FusionAuthClient.new(api_key, 'http://localhost:9011')

# set the issuer up correctly    
client_response = client.retrieve_tenants()
if client_response.was_successful
  tenant = client_response.success_response["tenants"][0]
else
  puts "couldn't find tenants " + client_response.error_response.to_s
  exit 1
end


client_response = client.patch_tenant(tenant["id"], {"tenant": {"issuer":"http://localhost:9011"}})
unless client_response.was_successful
  puts "couldn't update tenant "+ client_response.error_response.to_s
  exit 1
end

# generate RSA keypair for signing

client_response = client.generate_key(RSA_KEY_ID, {"key": {"algorithm":"RS256", "name":"For RailsExampleApp", "length": 2048}})
unless client_response.was_successful
  puts "couldn't create RSA key "+ client_response.error_response.to_s
  exit 1
end

# create application
# too much to inline it

application = {}
application["name"] = "RubyExampleAPI"

# configure oauth
application["oauthConfiguration"] = {}
application["oauthConfiguration"]["authorizedRedirectURLs"] = ["http://localhost:3000/auth/my_provider/callback"]
application["oauthConfiguration"]["clientSecret"] = "change-this-in-production-to-be-a-real-secret"

application["roles"] = ["ceo","dev","intern"]

# assign key from above to sign our tokens. This needs to be asymmetric
application["jwtConfiguration"] = {}
application["jwtConfiguration"]["enabled"] = true
application["jwtConfiguration"]["accessTokenKeyId"] = RSA_KEY_ID
application["jwtConfiguration"]["idTokenKeyId"] = RSA_KEY_ID

client_response = client.create_application(APPLICATION_ID, {"application": application})
unless client_response.was_successful
  puts "couldn't create application "+ client_response.error_response.to_s
  exit 1
end

# register user, there should be only one, so grab the first
client_response = client.search_users_by_query({"search": {"queryString":"*"}})
unless client_response.was_successful
  puts "couldn't find users "+ client_response.error_response.to_s
  exit 1
end

user = client_response.success_response["users"][0]

# now register the user
client_response = client.register(user["id"], {"registration":{"applicationId":APPLICATION_ID}})
unless client_response.was_successful
  puts "couldn't register user "+ client_response.error_response.to_s
  exit 1
end

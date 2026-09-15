namespace TestWebAPI
{
    class Program
    {
        static async Task Main()
        {
            string fusionAuthBaseUrl = "http://localhost:9011";
            string tokenEndpoint = $"{fusionAuthBaseUrl}/oauth2/token";
            string clientId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
            string clientSecret = "change-this-in-production-to-be-a-real-secret";
            string username = "admin@example.com";
            string password = "password";
            string apiUrl = "https://localhost:5001/WeatherForecast";

            var tokenData = new
            {
                grant_type = "password",
                client_id = clientId,
                client_secret = clientSecret,
                username = username,
                password = password
            };

            using var httpClient = new HttpClient();

            var tokenResponse = await httpClient.PostAsync(tokenEndpoint, new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", tokenData.grant_type),
                new KeyValuePair<string, string>("client_id", tokenData.client_id),
                new KeyValuePair<string, string>("client_secret", tokenData.client_secret),
                new KeyValuePair<string, string>("username", tokenData.username),
                new KeyValuePair<string, string>("password", tokenData.password)
            }));

            if (tokenResponse.IsSuccessStatusCode)
            {
                var tokenResponseContent = await tokenResponse.Content.ReadAsStringAsync();
                var token = Newtonsoft.Json.JsonConvert.DeserializeObject<TokenResponse>(tokenResponseContent)
                    ?.access_token;

                if (!string.IsNullOrEmpty(token))
                {
                    Console.WriteLine($"Bearer Token: {token}");

                    httpClient.DefaultRequestHeaders.Clear();
                    httpClient.DefaultRequestHeaders.Add("accept", "text/plain");
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

                    var weatherResponse = await httpClient.GetAsync(apiUrl);

                    if (weatherResponse.IsSuccessStatusCode)
                    {
                        var weatherResponseContent = await weatherResponse.Content.ReadAsStringAsync();
                        Console.WriteLine("Authenticated Request Successful");
                        Console.WriteLine(weatherResponseContent);
                    }
                    else
                    {
                        Console.WriteLine($"Authenticated Request Failed. Status Code: {weatherResponse.StatusCode}");
                        Console.WriteLine($"Response: {await weatherResponse.Content.ReadAsStringAsync()}");
                    }
                }
                else
                {
                    Console.WriteLine("Failed to obtain token. Token not found in the response.");
                }
            }
            else
            {
                Console.WriteLine($"Failed to obtain token. Status Code: {tokenResponse.StatusCode}");
                Console.WriteLine($"Response: {await tokenResponse.Content.ReadAsStringAsync()}");
            }
        }
    }

    public class TokenResponse
    {
        public string access_token { get; set; }
    }
}

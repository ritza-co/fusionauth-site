# Kafka Example Docker Compose Configurations

This example stages a development FusionAuth environment including Kafka which is a scalable messaging platform. This integration allows you to consume webhook events using a Kafka topic in addition to or instead of consuming the JSON events directly from a configured webhook, so events (for example, a “new user” event when a new user is created in FusionAuth) can be sent from FusionAuth to a Kafka topic.

## Kafka

You will need to input the configuration in the FusionAuth UI to configure the Kafka integration.

I.E. 
```
bootstrap.servers=kafka:9092
max.block.ms=5000
request.timeout.ms=2000
```

## Kickstart

More information around kickstart is available at https://fusionauth.io/docs/get-started/download-and-install/development/kickstart and docker compose related kickstart documentation at https://fusionauth.io/docs/get-started/download-and-install/docker#kickstart.

## Example Configuration for a Remote Managed Kafka Integration
```
bootstrap.servers=pkc-6ojv2.us-west4.gcp.your-kafka-provider.cloud:9092
client.dns.lookup=use_all_dns_ips
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule   required username='ZN6LJ5UHSXZLW3LR'   password='M9T8b85OPspFAS37Do5Baq7jIS+hl7h7bY8MRrfVff5lz8xeCwea7zB5AC3nKXUD';
sasl.mechanism=PLAIN
security.protocol=SASL_SSL
session.timeout.ms=45000
```

## Further Reading

[FusionAuth Kafka Integration](https://fusionauth.io/docs/extend/events-and-webhooks/kafka)

curl --location --request POST 'localhost:3476/v1/tenants/t1/permissions/lookup-entity' \
--header 'Content-Type: application/json' \
--data-raw '{
  "metadata": { "depth": 20 },
  "entity_type": "record",
  "permission": "view",
  "subject": { "type": "user", "id": "Alice" }
}'

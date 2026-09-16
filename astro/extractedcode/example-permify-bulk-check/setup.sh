# write schema - https://docs.permify.co/api-reference/schema/write-schema
schemaVersion=$(curl --location --request POST 'localhost:3476/v1/tenants/t1/schemas/write' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "schema": "entity user {\n  relation hasDoctor @user\n  relation hasGuardian @user\n  relation isChild @user\n}\n entity record {\n  relation owner @user\n  relation consultant @user\n  action view = (owner not owner.isChild) or owner.hasGuardian or owner.hasDoctor or consultant\n  action edit = owner.hasDoctor\n}"
}' | jq -r '.schema_version')

# write data - https://docs.permify.co/api-reference/data/write-data
curl --location --request POST 'localhost:3476/v1/tenants/t1/data/write' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "metadata": {"schema_version":"'"$schemaVersion"'"},
  "tuples":[
    {"entity":{"type":"user","id":"Carol"},"relation":"hasDoctor","subject":{"type":"user","id":"Alice"}},
    {"entity":{"type":"user","id":"Bob"},"relation":"isChild","subject":{"type":"user","id":"Bob"}},
    {"entity":{"type":"user","id":"Bob"},"relation":"hasGuardian","subject":{"type":"user","id":"Alice"}},
    {"entity":{"type":"user","id":"Dan"},"relation":"hasDoctor","subject":{"type":"user","id":"Eve"}},
    {"entity":{"type":"user","id":"Frank"},"relation":"hasDoctor","subject":{"type":"user","id":"Eve"}},

    {"entity":{"type":"record","id":"AliceRecord"},"relation":"owner","subject":{"type":"user", "id":"Alice"}},
    {"entity":{"type":"record","id":"BobRecord"},"relation":"owner","subject":{"type":"user", "id":"Bob"}},
    {"entity":{"type":"record","id":"CarolRecord"},"relation":"owner","subject":{"type":"user", "id":"Carol"}},
    {"entity":{"type":"record","id":"FrankRecord"},"relation":"owner","subject":{"type":"user", "id":"Frank"}},
    {"entity":{"type":"record","id":"FrankRecord"},"relation":"consultant","subject":{"type":"user", "id":"Alice"}},
    {"entity":{"type":"record","id":"EveRecord"},"relation":"owner","subject":{"type":"user", "id":"Eve"}},
    {"entity":{"type":"record","id":"DanRecord"},"relation":"owner","subject":{"type":"user", "id":"Dan"}}
  ]
}'

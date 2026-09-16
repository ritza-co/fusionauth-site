curl --location --request POST 'localhost:3476/v1/tenants/t1/permissions/bulk-check' \
--header 'Content-Type: application/json' \
--data-raw '{
	"metadata": {	"depth": 20 },
	"items": [
		{ "entity": { "type": "record", "id": "AliceRecord" }, "permission": "view", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "BobRecord" },   "permission": "view", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "CarolRecord" }, "permission": "view", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "FrankRecord" }, "permission": "view", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "EveRecord" },   "permission": "view", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "DanRecord" },   "permission": "view", "subject": { "type": "user", "id": "Alice" } },

		{ "entity": { "type": "record", "id": "AliceRecord" }, "permission": "view", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "BobRecord" },   "permission": "view", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "CarolRecord" }, "permission": "view", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "FrankRecord" }, "permission": "view", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "EveRecord" },   "permission": "view", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "DanRecord" },   "permission": "view", "subject": { "type": "user", "id": "Eve" } },

		{ "entity": { "type": "record", "id": "AliceRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "BobRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "CarolRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "FrankRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "EveRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Alice" } },
		{ "entity": { "type": "record", "id": "DanRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Alice" } },

		{ "entity": { "type": "record", "id": "AliceRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "BobRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "CarolRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "FrankRecord" }, "permission": "edit", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "EveRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Eve" } },
		{ "entity": { "type": "record", "id": "DanRecord" },   "permission": "edit", "subject": { "type": "user", "id": "Eve" } }
	]
}' | jq

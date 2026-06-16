/* ============================================================
   Creates the agewell-leads table in DynamoDB Local.
   Idempotent — skips if the table already exists.
   Run:  npm run db:init   (from backend/lead-handler)
   ============================================================ */
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
const TABLE = process.env.LEADS_TABLE || "agewell-leads";

const ddb = new DynamoDBClient({
  region: "us-east-1",
  endpoint: ENDPOINT,
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

try {
  await ddb.send(new DescribeTableCommand({ TableName: TABLE }));
  console.log(`Table "${TABLE}" already exists at ${ENDPOINT} — nothing to do.`);
} catch {
  await ddb.send(
    new CreateTableCommand({
      TableName: TABLE,
      AttributeDefinitions: [{ AttributeName: "leadId", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "leadId", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );
  console.log(`Created table "${TABLE}" at ${ENDPOINT}.`);
}

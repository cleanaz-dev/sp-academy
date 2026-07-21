import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda";

export const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createCommand = ({
  functionName,
  payload,
  invocationType = "Event" as InvocationType
}: {
  functionName: string;
  payload: any;
  invocationType?: InvocationType;
}) =>
  new InvokeCommand({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: Buffer.from(JSON.stringify(payload)),
  });
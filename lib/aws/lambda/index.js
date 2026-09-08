"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = exports.lambda = void 0;
var client_lambda_1 = require("@aws-sdk/client-lambda");
exports.lambda = new client_lambda_1.LambdaClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
var createCommand = function (_a) {
    var functionName = _a.functionName, payload = _a.payload, _b = _a.invocationType, invocationType = _b === void 0 ? "Event" : _b;
    return new client_lambda_1.InvokeCommand({
        FunctionName: functionName,
        InvocationType: invocationType,
        Payload: Buffer.from(JSON.stringify(payload)),
    });
};
exports.createCommand = createCommand;

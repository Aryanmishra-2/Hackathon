/**
 * Test Script to Find Working Bedrock Model IDs
 * 
 * This script tests multiple Claude model IDs to find which ones work
 * in your AWS account/region.
 * 
 * Usage:
 *   node test-bedrock-models.js
 */

require("dotenv").config();
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// List of Claude model IDs to test (ordered by preference)
const MODEL_IDS_TO_TEST = [
  // Claude 3.5 Sonnet (Latest)
  "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
  "anthropic.claude-3-5-sonnet-20240620-v1:0",
  "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
  
  // Claude 3 Sonnet
  "anthropic.claude-3-sonnet-20240229-v1:0",
  "us.anthropic.claude-3-sonnet-20240229-v1:0",
  
  // Claude 3 Haiku (Cheapest)
  "anthropic.claude-3-haiku-20240307-v1:0",
  "us.anthropic.claude-3-haiku-20240307-v1:0",
  
  // Claude 3.5 Haiku (New - if available)
  "anthropic.claude-3-5-haiku-20241022-v1:0",
  "us.anthropic.claude-3-5-haiku-20241022-v1:0",
];

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testModel(modelId) {
  try {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: "Respond with only: 'Model working!'",
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    if (responseBody.content && responseBody.content[0]) {
      return {
        success: true,
        response: responseBody.content[0].text,
      };
    }

    return { success: false, error: "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log("\n🧪 Testing Bedrock Claude Models...\n");
  console.log(`Region: ${process.env.AWS_REGION || "us-east-1"}\n`);
  console.log("=" . repeat(80));

  const workingModels = [];
  const failedModels = [];

  for (const modelId of MODEL_IDS_TO_TEST) {
    process.stdout.write(`Testing: ${modelId}... `);

    const result = await testModel(modelId);

    if (result.success) {
      console.log("✅ WORKING!");
      workingModels.push({
        modelId,
        response: result.response,
      });
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failedModels.push({
        modelId,
        error: result.error,
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📊 RESULTS:\n");

  if (workingModels.length > 0) {
    console.log("✅ WORKING MODELS:\n");
    workingModels.forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.modelId}`);
      console.log(`   Response: "${m.response}"`);
      
      if (idx === 0) {
        console.log("   👉 RECOMMENDED: Use this model ID in your .env file!");
      }
      console.log("");
    });

    console.log("\n🎯 UPDATE YOUR .env FILE:\n");
    console.log(`BEDROCK_MODEL_ID=${workingModels[0].modelId}\n`);
  } else {
    console.log("❌ NO WORKING MODELS FOUND!\n");
    console.log("Possible issues:");
    console.log("1. Model access not enabled in AWS Bedrock Console");
    console.log("2. Wrong AWS region");
    console.log("3. Insufficient IAM permissions");
    console.log("4. Invalid AWS credentials");
    console.log("\nRun this command to check available models:");
    console.log(`aws bedrock list-foundation-models --by-provider anthropic --region ${process.env.AWS_REGION || "us-east-1"}`);
  }

  if (failedModels.length > 0) {
    console.log("\n❌ FAILED MODELS:\n");
    failedModels.forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.modelId}`);
      console.log(`   Error: ${m.error}\n`);
    });
  }

  console.log("=".repeat(80) + "\n");
}

// Run the tests
runTests().catch(console.error);

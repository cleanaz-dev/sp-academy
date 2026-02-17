import { z } from 'zod';

// 1. Define the inner correction item
// We use .strict() to enforce no extra keys allowed
const correctionItem = z.object({
  original: z.string().nullable(),
  corrected: z.string().nullable(),
  reason: z.string().nullable()
}).strict().nullable(); 

// 2. Define the scoring schema
const scoringSchema = z.object({
  score: z.number().min(1).max(10),
  label: z.enum(["Poor", "OK", "Good", "Great", "Excellent"]),
  explanation: z.string().nullable(),
  improvedResponse: z.string().nullable(),
  
  // The object inside must be strict, and the whole field is nullable
  corrections: z.object({
    genderAgreement: correctionItem,
    vocabulary: correctionItem,
    article: correctionItem
  }).strict().nullable() 
}).strict(); // Root object must be strict

// 3. Generate the Schema
// Note: Depending on your Zod version, you might use zod-to-json-schema or z.toJSONSchema
// This code assumes you have a way to get the basic JSON schema object.
// If z.toJSONSchema is unavailable, install 'zod-to-json-schema' and use `zodToJsonSchema(scoringSchema)`
const initialSchema = (z as any).toJSONSchema 
  ? (z as any).toJSONSchema(scoringSchema)
  : require("zod-to-json-schema").zodToJsonSchema(scoringSchema, "user_scoring");


// 4. THE FIX: Recursive function to ensure API Strict Mode compliance
// Groq/OpenAI Strict Mode requires:
// - additionalProperties: false on ALL objects
// - All keys in 'properties' must appear in 'required'
function enforceStrictSchema(schema: any) {
  if (!schema || typeof schema !== 'object') return;

  // Handle "definitions" or "$defs" if generated
  if (schema.definitions) {
    Object.values(schema.definitions).forEach(enforceStrictSchema);
  }
  if (schema.$defs) {
    Object.values(schema.$defs).forEach(enforceStrictSchema);
  }

  // If it's an object type (and not a pure null type)
  if (schema.type === 'object' && schema.properties) {
    schema.additionalProperties = false;
    
    // FORCE all keys to be required
    schema.required = Object.keys(schema.properties);

    // Recursively clean children
    Object.values(schema.properties).forEach(enforceStrictSchema);
  }

  // Handle "anyOf" (which Zod uses for nullables: [Object, Null])
  if (schema.anyOf) {
    schema.anyOf.forEach(enforceStrictSchema);
  }
}

// Apply the fix
const cleanSchema = JSON.parse(JSON.stringify(initialSchema)); // Deep clone
delete cleanSchema.$schema; // Remove top-level $schema
enforceStrictSchema(cleanSchema);

export const userScoreSchema = cleanSchema;
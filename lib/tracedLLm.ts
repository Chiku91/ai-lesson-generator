// lib/tracedLLm.ts
import { Client } from "langsmith";
import { randomUUID } from "crypto";

export const lsClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY!,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
});

/**
 * Start a tracing run — always returns a valid runId
 */
export async function startTracingRun(
  name: string,
  input: any
): Promise<string> {
  const runId = randomUUID();

  await lsClient.createRun({
    id: runId, // 🔥 we set runId manually → no need to read return value
    name,
    project_name: process.env.LANGCHAIN_PROJECT || "ai-lesson-generator",
    run_type: "chain",
    inputs: { input },
    start_time: Date.now(), // must be number or ISO string
  });

  return runId;
}

/**
 * End a tracing run (success)
 */
export async function endTracingRun(
  runId: string,
  output: any
): Promise<void> {
  await lsClient.updateRun(runId, {
    outputs: { output },
    end_time: Date.now(),
  });
}

/**
 * End a tracing run with an error
 */
export async function endTracingRunError(
  runId: string,
  error: any
): Promise<void> {
  await lsClient.updateRun(runId, {
    error: String(error),
    end_time: Date.now(),
  });
}

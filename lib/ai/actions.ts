"use server";

import { revalidatePath } from "next/cache";
import { getAIProvider } from "@/ai";
import { validateGeneratedContent, validateGenerationInput } from "@/ai/schema";
import type { GenerateContentInput } from "@/ai/types";
import { getActiveWorkspace } from "@/lib/content/workspace";

export async function generateAIContent(rawInput: Record<string, unknown>) {
  const workspace = await getActiveWorkspace();
  const { errors, values } = validateGenerationInput(rawInput);
  if (Object.keys(errors).length) return { ok: false as const, errors };

  const input = values as GenerateContentInput;
  const provider = getAIProvider();
  let result;
  try {
    result = await provider.generateContent(input);
  } catch (error) {
    return { ok: false as const, errors: { form: error instanceof Error ? error.message : "AI generation failed." } };
  }

  const content = validateGeneratedContent(result.content);
  const { supabase, userId, workspaceId } = workspace;
  const { error } = await supabase.from("ai_generations").insert({
    workspace_id: workspaceId,
    user_id: userId,
    generation_type: "CONTENT_BUNDLE",
    input: JSON.stringify(input),
    output: JSON.stringify(content),
    provider: result.provider,
  });
  if (error) return { ok: false as const, errors: { form: `Content generated, but history could not be saved: ${error.message}` } };

  revalidatePath("/ai-studio");
  return { ok: true as const, content, provider: result.provider, model: result.model };
}

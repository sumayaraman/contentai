export async function socialFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body
        ? String((body as { error?: { message?: string } }).error?.message || "Social provider request failed.")
        : "Social provider request failed.";
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = response.status; error.body = body; throw error;
  }
  return body as T;
}

export function safeProviderError(error: unknown) {
  if (error instanceof Error) {
    if (/token|secret|authorization|credential/i.test(error.message)) return "The social provider rejected the request. Please reconnect the account.";
    return error.message.slice(0, 300);
  }
  return "The social provider request failed.";
}

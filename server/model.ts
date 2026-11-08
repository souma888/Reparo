// Only explicitly reviewed free-tier models may be used. Unknown settings fail closed.
export const defaultModel = "gemini-3.5-flash-lite";
export function freeModel() {
  const selected = process.env.GOOGLE_AI_MODEL?.trim() || defaultModel;
  if (![defaultModel].includes(selected))
    throw new Error("MODEL_NOT_FREE_APPROVED");
  return selected;
}
export function aiAvailable() {
  try {
    return (
      Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY) && Boolean(freeModel())
    );
  } catch {
    return false;
  }
}

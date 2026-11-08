const key = "reparo-ai-attempts-v1";
let unavailable = 0;
export function attemptsUsed(): number {
  try {
    const v = Number(sessionStorage.getItem(key) || 0);
    return Number.isSafeInteger(v) && v >= 0 ? v : 3;
  } catch {
    return unavailable;
  }
}
export function takeAttempt(): boolean {
  const count = attemptsUsed();
  if (count >= 3) return false;
  try {
    sessionStorage.setItem(key, String(count + 1));
  } catch {
    unavailable = count + 1;
  }
  return true;
}

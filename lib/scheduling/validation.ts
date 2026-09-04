export function parseFutureSchedule(value: string | null | undefined) {
  if (!value) return { value: null, error: "Choose a date and time." };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { value: null, error: "Enter a valid date and time." };
  }

  if (parsed.getTime() <= Date.now()) {
    return { value: null, error: "Scheduled posts must be set for a future date and time." };
  }

  return { value: parsed.toISOString(), error: null };
}

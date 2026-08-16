const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
  return EMAIL_PATTERN.test(email.trim());
};

/**
 * Initials used as an avatar fallback while the profile picture loads or when
 * a creator has none set.
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return initials.toUpperCase() || "?";
};

/**
 * Pulls a human readable message out of an axios error, falling back to a
 * generic line so the UI never renders "undefined" to a creator.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  const response = (
    error as { response?: { data?: { message?: string; error?: string } } }
  )?.response;

  return response?.data?.message || response?.data?.error || fallback;
};

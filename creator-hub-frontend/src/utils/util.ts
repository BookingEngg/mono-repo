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
 * Formats an amount in MAJOR currency units (rupees, not paise) for display.
 * Gateway payloads use minor units, but everything user-facing — and every
 * amount our own API returns — is major, so this never divides by 100.
 */
export const formatCurrency = (amount: number, currency = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    // A whole amount renders as "₹1,200", not "₹1,200.00" — matching how the
    // backend formats the same figures inside earning_display, so a price and
    // the commission derived from it don't disagree in the same row.
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Pulls a human readable message out of an axios error, falling back to a
 * generic line so the UI never renders "undefined" to a creator.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const response = (
    error as { response?: { data?: { message?: string; error?: string } } }
  )?.response;

  return response?.data?.message || response?.data?.error || fallback;
};

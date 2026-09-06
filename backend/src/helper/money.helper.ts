/**
 * Money rendered for display, formatted once on the server.
 *
 * Kept in one place so a figure and anything derived from it can't disagree
 * about grouping or decimals — the same rule formats a job's selling price, a
 * creator's commission, and a checkout line.
 *
 * `en-IN` grouping is deliberate: Indian digit grouping is 1,20,000 rather
 * than 120,000, and a rupee figure grouped the western way reads as wrong.
 *
 * Whole amounts render as "₹2,000" rather than "₹2,000.00" — the trailing
 * zeros add nothing, and paise only appear when they're actually there.
 */
export const formatMoney = (amount: number, currency = "INR"): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

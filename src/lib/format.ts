// INR currency formatter (e.g. ₹1,29,900)
export const formatINR = (value: number | string, opts?: { decimals?: boolean }) => {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: opts?.decimals ? 2 : 0,
    minimumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(n);
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "CAD", symbol: "$", label: "Canadian Dollar (CA$)" },
  { code: "AUD", symbol: "$", label: "Australian Dollar (AU$)" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(amount: number, code: string): string {
  return `${currencySymbol(code)}${Math.round(amount).toLocaleString()}`;
}

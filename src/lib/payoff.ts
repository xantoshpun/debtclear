export type PayoffStrategy = "avalanche" | "snowball";

export type PayoffInputDebt = {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
};

export type PayoffDebtResult = PayoffInputDebt & {
  monthsToPayoff: number | null;
  totalInterest: number;
};

export type PayoffPlan = {
  order: PayoffDebtResult[];
  months: number | null;
  totalInterest: number;
  /** Total remaining balance across all debts, indexed by month (0 = starting balance). */
  balanceSeries: number[];
};

const MAX_MONTHS = 600;

function sortByStrategy(debts: PayoffInputDebt[], strategy: PayoffStrategy) {
  const copy = [...debts];
  return strategy === "avalanche"
    ? copy.sort((a, b) => b.interestRate - a.interestRate)
    : copy.sort((a, b) => a.balance - b.balance);
}

export function simulatePayoff(
  debts: PayoffInputDebt[],
  strategy: PayoffStrategy,
  extraMonthly: number,
  lumpSum: number = 0,
): PayoffPlan {
  const order = sortByStrategy(debts, strategy);
  const working = order.map((d) => ({
    ...d,
    remaining: d.balance,
    monthsToPayoff: null as number | null,
    totalInterest: 0,
  }));

  let month = 0;
  let freedMinimums = 0;
  const balanceSeries: number[] = [working.reduce((sum, d) => sum + d.remaining, 0)];

  while (working.some((d) => d.remaining > 0.01) && month < MAX_MONTHS) {
    month++;
    const extraAvailable = extraMonthly + freedMinimums + (month === 1 ? lumpSum : 0);
    const firstActiveIndex = working.findIndex((d) => d.remaining > 0.01);

    working.forEach((d, i) => {
      if (d.remaining <= 0.01) return;
      const monthlyRate = d.interestRate / 100 / 12;
      const interest = d.remaining * monthlyRate;
      d.totalInterest += interest;
      d.remaining += interest;

      let payment = d.minimumPayment;
      if (i === firstActiveIndex) payment += extraAvailable;
      payment = Math.min(payment, d.remaining);
      d.remaining -= payment;

      if (d.remaining <= 0.01) {
        d.remaining = 0;
        d.monthsToPayoff = month;
        freedMinimums += d.minimumPayment;
      }
    });

    balanceSeries.push(working.reduce((sum, d) => sum + d.remaining, 0));
  }

  const allPaidOff = working.every((d) => d.remaining <= 0.01);
  const totalInterest = working.reduce((sum, d) => sum + d.totalInterest, 0);

  return {
    order: working.map(({ remaining: _remaining, ...rest }) => rest),
    months: allPaidOff ? month : null,
    totalInterest,
    balanceSeries,
  };
}

export function formatMonthsAsDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths}m`;
  if (remMonths === 0) return `${years}y`;
  return `${years}y ${remMonths}m`;
}

export function addMonthsLabel(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

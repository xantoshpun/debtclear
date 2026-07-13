import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    number: "01",
    title: "Add your numbers",
    body: "Every debt, income source, and expense in one place, tagged to you or anyone else you add.",
  },
  {
    number: "02",
    title: "Pick a strategy",
    body: "Avalanche pays the highest interest first. Snowball clears the smallest balance first. DebtClear runs the math either way.",
  },
  {
    number: "03",
    title: "Watch the date move",
    body: "Slide in an extra payment and see exactly how much sooner you are debt-free, and how much interest it saves.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <h2 className="text-3xl font-black tracking-tight text-ink sm:text-4xl dark:text-zinc-50">
          Three steps, not a spreadsheet
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col divide-y divide-ink/10 dark:divide-white/10">
        {STEPS.map((step, i) => (
          <Reveal key={step.number} delay={i * 0.08} className="flex gap-6 py-8 first:pt-0">
            <span className="w-14 shrink-0 font-mono text-3xl font-semibold text-brand-hover dark:text-brand">
              {step.number}
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="mt-2 max-w-lg text-base leading-relaxed text-body dark:text-zinc-300">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

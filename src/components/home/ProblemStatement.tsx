import { Reveal } from "@/components/Reveal";

export function ProblemStatement() {
  return (
    <section className="bg-canvas px-6 py-24 dark:bg-zinc-900/40">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-2xl font-medium leading-snug text-ink sm:text-3xl dark:text-zinc-50">
          Most debt is scattered across cards, loans, and shared bills, so the
          full picture never sits in one place. Without that picture, it is
          hard to know which balance to attack first, or when any of it
          actually ends.
        </p>
      </Reveal>
    </section>
  );
}

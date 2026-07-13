import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function FinalCta() {
  return (
    <section className="px-6 py-24">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl bg-brand-pale px-8 py-16 text-center dark:bg-zinc-900">
        <h2 className="text-3xl font-black tracking-tight text-ink sm:text-4xl dark:text-zinc-50">
          See your debt-free date today
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-body dark:text-zinc-300">
          Add your first debt in under a minute. No card required.
        </p>
        <Link
          href="/signup"
          className="mt-8 rounded-3xl bg-brand px-8 py-3.5 text-base font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98]"
        >
          Get started free
        </Link>
      </Reveal>
    </section>
  );
}

import { UserPlus } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/Reveal";

export function HouseholdSpotlight() {
  return (
    <section id="household" className="bg-ink px-6 py-24 dark:bg-black">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Works alone. Works better together.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/70">
          Start solo. Add a partner, or anyone else you share money with, any
          time, with no separate login for them. Every debt, income source,
          and bill carries an owner, so the combined total and each person&apos;s
          share are both one click away.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-white/60">You</p>
          <p className="mt-2 text-2xl font-black text-white">£33,392</p>
          <p className="mt-1 text-sm text-white/50">£2,200/mo income</p>
        </div>

        <div className="flex flex-col items-start justify-center gap-2 rounded-3xl border border-dashed border-white/20 p-6">
          <UserPlus size={22} weight="bold" className="text-brand" />
          <p className="text-sm font-semibold text-white">Add a profile</p>
          <p className="text-sm text-white/50">
            Track a partner, roommate, or anyone else, whenever you&apos;re ready.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

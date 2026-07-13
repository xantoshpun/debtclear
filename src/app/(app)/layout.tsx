import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app-shell/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("name")
    .eq("account_id", user.id)
    .order("created_at");

  if (!profiles || profiles.length === 0) redirect("/onboarding");

  const subtitle = profiles.map((p) => p.name).join(" & ");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas-soft lg:flex-row dark:bg-zinc-950">
      <Sidebar subtitle={subtitle} />
      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

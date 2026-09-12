import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboard } from "@/lib/game/queries";
import Dashboard from "@/components/play/Dashboard";

export const metadata: Metadata = {
  title: "Your quests | Life RPG",
  description: "Your character, quests, attributes and shop.",
};

// Character state changes on every action, so this page is never cached.
export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const data = await getDashboard();

  // Middleware already guards this route. This is the second line of defence
  // in case the session expires between the middleware check and the render.
  if (!data) redirect("/login");

  return (
    <Dashboard
      profile={data.profile}
      attributes={data.attributes}
      quests={data.quests}
      completions={data.completions}
      owned={Array.from(data.owned)}
      shop={data.shop}
    />
  );
}

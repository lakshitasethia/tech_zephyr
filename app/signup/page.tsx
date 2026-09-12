import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create your character | Life RPG",
  description:
    "Start Life RPG. Turn real tasks into quests, earn gold, and buy the light back.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <AuthForm mode="signup" />
    </main>
  );
}

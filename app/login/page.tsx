import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in | Life RPG",
  description: "Sign in to Life RPG and pick up where your character left off.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <AuthForm mode="login" />
    </main>
  );
}

import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in: DebtClear",
  description: "Sign in to your DebtClear account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      variant="login"
      heading="Welcome back"
      subtext="Sign in to your account."
    >
      <LoginForm />
    </AuthShell>
  );
}

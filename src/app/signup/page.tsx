import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up: DebtClear",
  description: "Create your free DebtClear account.",
};

export default function SignupPage() {
  return (
    <AuthShell
      variant="signup"
      heading="Create your account"
      subtext="Start tracking free. No card required."
    >
      <SignupForm />
    </AuthShell>
  );
}

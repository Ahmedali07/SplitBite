import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

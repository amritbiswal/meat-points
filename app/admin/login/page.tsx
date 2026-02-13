"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!res || res.error) {
      setErr("Invalid credentials");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Admin Login</h1>
      <p className="mt-1 text-sm text-zinc-600">Only admin can login.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white">
          Login
        </button>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}
      </form>
    </div>
  );
}

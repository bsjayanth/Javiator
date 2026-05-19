"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-3xl border border-white/[0.06] bg-[#111111] p-10 shadow-[0_32px_80px_rgba(0,0,0,0.55)]">
        <div className="w-12 h-12 rounded-2xl bg-[#151515] border border-white/[0.06] flex items-center justify-center mb-6">
          <span className="text-white font-bold text-lg">J</span>
        </div>

        <h1 className="text-3xl text-[#FAFAFA] font-bold tracking-tight">
          Javiator
        </h1>
        <p className="text-[#A1A1AA] mt-2 text-sm">
          Enterprise logistics intelligence · sign in to continue
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">
              Username
            </label>
            <input
              placeholder="your.username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mt-1.5 w-full h-12 rounded-xl bg-[#0D0D0D] border border-white/[0.06] px-4 text-[#FAFAFA] outline-none focus:border-white/[0.12] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#71717A]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mt-1.5 w-full h-12 rounded-xl bg-[#0D0D0D] border border-white/[0.06] px-4 text-[#FAFAFA] outline-none focus:border-white/[0.12] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400/90 text-sm">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#FAFAFA] text-[#111111] font-semibold transition-all duration-200 hover:bg-white disabled:opacity-60"
          >
            {loading ? "Authenticating…" : "Sign in"}
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-[#52525B]">
          Route optimization · predictive ETA · operational AI
        </p>
      </div>
    </div>
  );
}

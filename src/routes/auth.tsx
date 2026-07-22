import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GradientBlobs } from "@/components/GradientBlobs";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Вход — Трекер развивающих занятий" },
      { name: "description", content: "Войдите или зарегистрируйтесь, чтобы сохранять статистику." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || password.length < 6) {
      setError("Введите email и пароль (минимум 6 символов).");
      return;
    }
    setLoading(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            });
      if (error) {
        setError(error.message);
      } else {
        navigate({ to: "/" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-white to-[oklch(0.965_0.02_270)] px-5 pb-8 pt-10">
        <GradientBlobs />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              {mode === "signin" ? "С возвращением" : "Создайте аккаунт"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Войдите, чтобы ваши отметки и статистика хранились в облаке."
              : "Зарегистрируйтесь по email — данные будут привязаны к вашему аккаунту."}
          </p>
        </div>
      </header>

      <main className="px-4 pt-6">
        <form
          onSubmit={submit}
          className="space-y-3 rounded-3xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]"
        >
          <label className="block text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
          />
          <label className="block text-xs font-medium text-muted-foreground">Пароль</label>
          <input
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            className="w-full rounded-2xl bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
          />

          {error && (
            <div className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading
              ? "Секундочку…"
              : mode === "signin"
                ? "Войти"
                : "Зарегистрироваться"}
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="w-full rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.45_0.25_285)]"
          >
            {mode === "signin" ? "Создать аккаунт" : "У меня уже есть аккаунт"}
          </button>
        </form>
      </main>
    </div>
  );
}

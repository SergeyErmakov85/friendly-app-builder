import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GradientBlobs } from "@/components/GradientBlobs";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "signup" } => ({
    mode: search.mode === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Вход — Трекер развивающих занятий" },
      { name: "description", content: "Войдите или зарегистрируйтесь, чтобы сохранять статистику." },
    ],
  }),
});

type Mode = "signin" | "signup" | "forgot" | "reset";

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Неверный email или пароль. Если не помните пароль — нажмите «Забыли пароль?».";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Такой пользователь уже зарегистрирован. Попробуйте войти или сбросить пароль.";
  if (m.includes("email not confirmed"))
    return "Email не подтверждён. Проверьте почту и перейдите по ссылке из письма.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Слишком много попыток. Подождите немного и попробуйте снова.";
  if (m.includes("should be different from the old password"))
    return "Новый пароль должен отличаться от старого.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery"))
      return "reset";
    return initialMode ?? "signin";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setError(null);
        setNotice("Придумайте новый пароль и сохраните его.");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      const recovery =
        typeof window !== "undefined" && window.location.hash.includes("type=recovery");
      if (data.session && !recovery) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "forgot") {
      if (!email) {
        setError("Введите email, на который зарегистрирован аккаунт.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) setError(translateAuthError(error.message));
        else
          setNotice(
            "Письмо со ссылкой для сброса пароля отправлено. Проверьте почту (и папку «Спам»).",
          );
      } finally {
        setLoading(false);
      }
      return;
    }
    if (mode === "reset") {
      if (password.length < 6) {
        setError("Новый пароль должен быть не короче 6 символов.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) setError(translateAuthError(error.message));
        else navigate({ to: "/" });
      } finally {
        setLoading(false);
      }
      return;
    }
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
        setError(translateAuthError(error.message));
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
              {mode === "signin" && "С возвращением"}
              {mode === "signup" && "Создайте аккаунт"}
              {mode === "forgot" && "Сброс пароля"}
              {mode === "reset" && "Новый пароль"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" &&
              "Войдите, чтобы ваши отметки и статистика хранились в облаке."}
            {mode === "signup" &&
              "Зарегистрируйтесь по email — данные будут привязаны к вашему аккаунту."}
            {mode === "forgot" &&
              "Укажите email — мы пришлём ссылку для создания нового пароля."}
            {mode === "reset" && "Придумайте новый пароль для входа в аккаунт."}
          </p>
        </div>
      </header>

      <main className="px-4 pt-6">
        <form
          onSubmit={submit}
          className="space-y-3 rounded-3xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]"
        >
          {mode !== "reset" && (
            <>
              <label className="block text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
              />
            </>
          )}
          {mode !== "forgot" && (
            <>
              <label className="block text-xs font-medium text-muted-foreground">
                {mode === "reset" ? "Новый пароль" : "Пароль"}
              </label>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-2xl bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-1 ring-black/[0.04] transition-shadow focus:ring-2 focus:ring-[oklch(0.62_0.22_264)]"
              />
            </>
          )}

          {error && (
            <div className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-2xl bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
              {notice}
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
                : mode === "signup"
                  ? "Зарегистрироваться"
                  : mode === "forgot"
                    ? "Отправить ссылку"
                    : "Сохранить пароль"}
          </button>

          {mode === "signin" && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                setMode("forgot");
              }}
              className="w-full py-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Забыли пароль?
            </button>
          )}

          {mode !== "reset" && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="w-full rounded-full border-2 border-[oklch(0.62_0.22_264)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.45_0.25_285)]"
            >
              {mode === "signin" ? "Создать аккаунт" : "У меня уже есть аккаунт"}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}

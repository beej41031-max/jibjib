"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Check, ArrowRight, MailCheck, Loader2, MapPin, Trophy, Sparkles, BadgeCheck, Lock, UserPlus, LogIn, Mail } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useAuth } from "@/components/AuthProvider";
import { LangToggle } from "@/components/LangToggle";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { tileGradient } from "@/lib/utils";
import { CultureStrip, StickerStack } from "@/components/ui";
import { JibJibLogo } from "@/components/JibJibLogo";

type Status = "idle" | "working" | "sent" | "error";
type AuthMode = "password" | "magic";

const sampleStamps = ["LIFE Roaster", "Nap's", "Anna", "HAG", "Mojo", "Loginn"];

function authMessage(err: unknown, fallback: string) {
  const msg = err instanceof Error ? err.message : "";
  if (!msg) return fallback;
  if (/rate limit/i.test(msg)) return "Email rate limit hit. Use password login or wait before trying magic links again.";
  if (/invalid login credentials/i.test(msg)) return "Wrong email or password, or the account does not exist yet.";
  if (/password/i.test(msg) && /6/i.test(msg)) return "Password must be at least 6 characters.";
  return msg;
}

export default function LoginPage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<AuthMode>("password");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("error")) {
      setStatus("error");
      setErrorMsg(t("login.error"));
    }
  }, [t]);

  async function signInPassword() {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    router.replace("/");
  }

  async function createAccount() {
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    if (data.session) {
      router.replace("/");
      return;
    }
    setStatus("sent");
  }

  async function sendMagicLink() {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    setStatus("sent");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) {
      setStatus("error");
      setErrorMsg(t("login.configMissing"));
      return;
    }
    setStatus("working");
    setErrorMsg("");
    try {
      if (mode === "magic") await sendMagicLink();
      else await signInPassword();
    } catch (err) {
      setStatus("error");
      setErrorMsg(authMessage(err, t("login.error")));
    }
  }

  async function onCreateAccount() {
    if (!configured) {
      setStatus("error");
      setErrorMsg(t("login.configMissing"));
      return;
    }
    if (!email.trim() || password.length < 6) {
      setStatus("error");
      setErrorMsg(t("login.passwordMin"));
      return;
    }
    setStatus("working");
    setErrorMsg("");
    try {
      await createAccount();
    } catch (err) {
      setStatus("error");
      setErrorMsg(authMessage(err, t("login.error")));
    }
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-6">
      <div className="absolute right-5 top-5 z-10">
        <LangToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="animate-rise mb-7 flex items-center gap-2.5">
          <JibJibLogo variant="mark" className="h-11 w-11 shrink-0" />
          <span className="leading-none">
            <JibJibLogo variant="word" className="h-[38px] w-[126px] -ml-1" />
            <span className="-mt-1 block font-thai text-[11px] font-semibold text-ink-soft">{locale === "th" ? "อุบล คอฟฟี่ พาสปอร์ต" : "Ubon coffee passport"}</span>
          </span>
        </div>

        <div className="hero-aurora scene-glow chrome-edge animate-rise rounded-[34px] p-5 text-cream" style={{ animationDelay: "40ms" }}>
          <StickerStack />
          <div className="relative z-10 mb-5 flex justify-center">
            <JibJibLogo dark className="w-[260px] max-w-full" />
          </div>
          <div className="relative z-10">
            <p className="font-thai text-[13px] font-semibold text-honey">{t("login.kicker")}</p>
            <h1 className="thai-pop-title mt-2 text-[40px] font-black leading-[0.92] tracking-[-0.075em]">
              {t("app.tagline")}
            </h1>
            <p className="mt-4 max-w-[19rem] text-[14px] leading-relaxed text-cream/65">
              {t("login.sub")}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <LoginStat icon={<MapPin size={15} />} label={t("login.statMap")} />
              <LoginStat icon={<Trophy size={15} />} label={t("login.statRank")} />
              <LoginStat icon={<Sparkles size={15} />} label={t("login.statCard")} />
              <div className="col-span-3 feedline mt-1 text-left"><span className="feedline-dot" /><span className="truncate font-thai text-[11px]">{t("culture.noReviewDrama")} · {t("culture.madeInUbon")}</span><BadgeCheck size={13} className="ml-auto text-honey" /></div>
            </div>
          </div>
        </div>

        <div className="animate-rise mt-4" style={{ animationDelay: "90ms" }}><CultureStrip /></div>

        <div className="animate-rise mb-7 mt-5 flex gap-2" style={{ animationDelay: "120ms" }}>
          {sampleStamps.map((name, i) => (
            <div
              key={name}
              className="relative h-11 w-11 overflow-hidden rounded-[18px] border border-white/40 shadow-card"
              style={i < 4 ? { background: tileGradient(name) } : { borderWidth: 1, borderStyle: "dashed", background: "rgba(251,247,239,0.72)" }}
            >
              {i < 4 ? (
                <Check size={16} className="absolute inset-0 m-auto text-cream" strokeWidth={3} />
              ) : (
                <Coffee size={16} className="absolute inset-0 m-auto text-line" strokeWidth={1.6} />
              )}
            </div>
          ))}
        </div>

        {status === "sent" ? (
          <div className="surface-luxe animate-rise flex flex-col items-center gap-3 rounded-[30px] p-7 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-jade-wash">
              <MailCheck className="text-jade" />
            </span>
            <p className="text-lg font-semibold">{t("login.sent")}</p>
            <p className="text-sm text-ink-soft">
              {t("login.sentSub", { email })}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="animate-rise flex flex-col gap-3" style={{ animationDelay: "180ms" }}>
            <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-line/70 bg-white/55 p-1 shadow-soft">
              <button
                type="button"
                onClick={() => { setMode("password"); setStatus("idle"); setErrorMsg(""); }}
                className={`rounded-[18px] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${mode === "password" ? "bg-ink text-cream shadow-card" : "text-ink-soft hover:bg-white/70"}`}
              >
                {t("login.passwordTab")}
              </button>
              <button
                type="button"
                onClick={() => { setMode("magic"); setStatus("idle"); setErrorMsg(""); }}
                className={`rounded-[18px] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${mode === "magic" ? "bg-ink text-cream shadow-card" : "text-ink-soft hover:bg-white/70"}`}
              >
                {t("login.magicTab")}
              </button>
            </div>

            <label className="eyebrow" htmlFor="email">
              {t("login.emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              className="field"
            />

            {mode === "password" && (
              <>
                <label className="eyebrow" htmlFor="password">
                  {t("login.passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="field"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button type="submit" disabled={status === "working"} className="btn btn-primary btn-lg mt-1 w-full">
                    {status === "working" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                    {t("login.signIn")}
                  </button>
                  <button type="button" onClick={onCreateAccount} disabled={status === "working"} className="btn btn-ghost btn-lg mt-1 w-full border border-line bg-white/70">
                    {status === "working" ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                    {t("login.create")}
                  </button>
                </div>
                <p className="text-center text-xs leading-relaxed text-ink-soft">
                  <Lock size={12} className="-mt-0.5 mr-1 inline" />
                  {t("login.passwordHelp")}
                </p>
              </>
            )}

            {mode === "magic" && (
              <button type="submit" disabled={status === "working"} className="btn btn-primary btn-lg mt-1 w-full">
                {status === "working" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t("login.sending")}
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    {t("login.send")}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}

            {status === "error" && <p className="text-center text-sm text-clay">{errorMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

function LoginStat({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-[20px] border border-cream/15 bg-cream/10 px-2.5 py-2.5 text-center backdrop-blur-md">
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-cream/10 text-honey">{icon}</span>
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-cream/62">{label}</p>
    </div>
  );
}

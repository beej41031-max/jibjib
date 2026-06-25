"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map as MapIcon, Trophy, CreditCard } from "lucide-react";
import { useT } from "@/i18n/provider";
import { LangToggle } from "./LangToggle";
import { JibJibLogo } from "./JibJibLogo";

const tabs = [
  { href: "/", icon: Home, key: "nav.home" },
  { href: "/map", icon: MapIcon, key: "nav.map" },
  { href: "/leaderboard", icon: Trophy, key: "nav.board" },
  { href: "/card", icon: CreditCard, key: "nav.you" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale } = useT();
  const bare = pathname === "/login" || pathname.startsWith("/auth");

  if (bare) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col phone-glow">
      <header className="sticky top-0 z-30 px-4 pt-3">
        <div className="surface-luxe scene-glow flex items-center justify-between rounded-[26px] px-3.5 py-2.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <JibJibLogo variant="mark" className="h-10 w-10 shrink-0" />
            <span className="leading-none">
              <JibJibLogo variant="word" className="h-[34px] w-[112px] -ml-1" />
              <span className="-mt-1 block font-thai text-[10px] font-semibold text-ink-soft">
                {locale === "th" ? "จิบ · เช็กอิน · สะสม" : "Sip · Stamp · Flex"}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="street-label gold hidden sm:inline-flex">UBN β</span>
            <LangToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-3">
        <div className="nav-glass rounded-[28px] p-1.5">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map(({ href, icon: Icon, key }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 rounded-[22px] px-1 py-2.5 font-mono text-[9px] uppercase tracking-wider transition-all ${
                    active ? "nav-pill-active" : "text-ink-soft hover:bg-cream/70"
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.6 : 1.9} />
                  {t(key)}
                </Link>
              );
            })}
          </div>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </nav>
    </div>
  );
}

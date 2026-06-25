"use client";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/i18n/provider";
import { AuthProvider } from "./AuthProvider";
import { AppFrame } from "./AppFrame";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AppFrame>{children}</AppFrame>
      </AuthProvider>
    </LocaleProvider>
  );
}

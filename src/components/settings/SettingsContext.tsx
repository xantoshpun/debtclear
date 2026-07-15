"use client";

import { createContext, useContext } from "react";
import type { PayoffStrategy } from "@/lib/payoff";

export type Settings = {
  defaultStrategy: PayoffStrategy;
  currency: string;
};

const DEFAULT_SETTINGS: Settings = { defaultStrategy: "avalanche", currency: "USD" };

const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Settings {
  return useContext(SettingsContext);
}

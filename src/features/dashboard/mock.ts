/**
 * Mock data for the dashboard's stubbed pieces (AI assistant chart + notification
 * feed). Per the MVP rules these are placeholders — no real aggregation/AI yet.
 * Display text is localized via the dictionaries; only numbers/structure live here.
 */

export type ChartMode = "month" | "year12" | "ytd";

// Bar values in THB. `month` = weekly buckets; `year12` = last 12 months;
// `ytd` = Jan..current month.
const MOCK_BARS: Record<ChartMode, number[]> = {
  month: [4200, 6800, 5100, 7300],
  year12: [
    32000, 28000, 41000, 38000, 45000, 39000, 52000, 48000, 44000, 50000, 47000,
    43000,
  ],
  ytd: [32000, 28000, 41000, 38000, 45000, 39000, 21000],
};

export function getMockBars(mode: ChartMode): number[] {
  return MOCK_BARS[mode];
}

export type MockNotificationType =
  | "spending_warning"
  | "money_in"
  | "subscription_renewal";

export type MockNotification = {
  id: string;
  type: MockNotificationType;
  minutesAgo: number;
  amount?: number;
  read: boolean;
};

// Newest first; `read: false` items drive the header bell's unread dot + tint.
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "n1", type: "spending_warning", minutesAgo: 45, read: false },
  { id: "n2", type: "money_in", minutesAgo: 180, amount: 15000, read: false },
  { id: "n3", type: "subscription_renewal", minutesAgo: 1440, amount: 349, read: true },
  { id: "n4", type: "money_in", minutesAgo: 2880, amount: 8500, read: true },
  { id: "n5", type: "spending_warning", minutesAgo: 4320, read: true },
];

import type { UserRole } from "@/types/user";

export type RoleCapabilities = {
  showKpis: boolean;
  showAnalytics: boolean;
  showFleetMap: boolean;
  showDispatch: boolean;
  showAiInsights: boolean;
  showActivityFeed: boolean;
  showOperationalIntel: boolean;
};

const capabilities: Record<UserRole, RoleCapabilities> = {
  admin: {
    showKpis: true,
    showAnalytics: true,
    showFleetMap: true,
    showDispatch: true,
    showAiInsights: true,
    showActivityFeed: true,
    showOperationalIntel: true,
  },
  manager: {
    showKpis: true,
    showAnalytics: true,
    showFleetMap: true,
    showDispatch: true,
    showAiInsights: false,
    showActivityFeed: true,
    showOperationalIntel: false,
  },
  driver: {
    showKpis: true,
    showAnalytics: false,
    showFleetMap: true,
    showDispatch: true,
    showAiInsights: false,
    showActivityFeed: false,
    showOperationalIntel: false,
  },
  client: {
    showKpis: false,
    showAnalytics: false,
    showFleetMap: true,
    showDispatch: false,
    showAiInsights: false,
    showActivityFeed: false,
    showOperationalIntel: false,
  },
};

export function getRoleCapabilities(role: UserRole): RoleCapabilities {
  return capabilities[role];
}

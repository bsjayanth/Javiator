export type RoleCapabilities = {

  showKpis: boolean;

  showAnalytics: boolean;

  showFleetMap: boolean;

  showDispatch: boolean;

  showAiInsights: boolean;

  showActivityFeed: boolean;

  showFleetManagement: boolean;
};


export const getRoleCapabilities = (
  role?: string | null
): RoleCapabilities => {

  const normalizedRole =
    role?.toLowerCase() || "";

  // =====================================================
  // 🚀 ADMIN
  // =====================================================

  if (normalizedRole === "admin") {

    return {

      showKpis: true,

      showAnalytics: true,

      showFleetMap: true,

      showDispatch: true,

      showAiInsights: true,

      showActivityFeed: true,

      showFleetManagement: true,
    };
  }

  // =====================================================
  // 🚀 MANAGER
  // =====================================================

  if (normalizedRole === "manager") {

    return {

      showKpis: true,

      showAnalytics: true,

      showFleetMap: true,

      showDispatch: true,

      showAiInsights: true,

      showActivityFeed: true,

      showFleetManagement: true,
    };
  }

  // =====================================================
  // 🚀 DRIVER
  // =====================================================

  if (normalizedRole === "driver") {

    return {

      showKpis: true,

      showAnalytics: false,

      showFleetMap: true,

      showDispatch: true,

      showAiInsights: false,

      showActivityFeed: false,

      showFleetManagement: false,
    };
  }

  // =====================================================
  // 🚀 CLIENT
  // =====================================================

  if (normalizedRole === "client") {

    return {

      showKpis: false,

      showAnalytics: false,

      showFleetMap: true,

      showDispatch: false,

      showAiInsights: false,

      showActivityFeed: false,

      showFleetManagement: false,
    };
  }

  // =====================================================
  // 🚀 DEFAULT
  // =====================================================

  return {

    showKpis: false,

    showAnalytics: false,

    showFleetMap: false,

    showDispatch: false,

    showAiInsights: false,

    showActivityFeed: false,

    showFleetManagement: false,
  };
};
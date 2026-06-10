import type { BrandIconEntry } from "@/features/qr-code/assets/brand-icons"
import type {
  QrStudioState,
  StudioGradient,
} from "@/features/qr-code/model/state"

export type DashboardCornerColorKey = "cornersSquare" | "cornersDot"
export type DashboardAssetKey = "backgroundImage" | "logo"

export function createDashboardAccordionOpenItemIds(selectedItemId: string) {
  return [selectedItemId]
}

export function ensureDashboardAccordionItemExpanded(
  openItemIds: string[],
  selectedItemId: string,
) {
  return openItemIds.includes(selectedItemId)
    ? openItemIds
    : [...openItemIds, selectedItemId]
}

export function applyDotsSolidColor(state: QrStudioState, color: string) {
  return {
    ...state,
    dotsColorMode: "solid" as const,
    dataModulesSettings: {
      ...state.dataModulesSettings,
      color,
    },
  }
}

export function applyDotsGradient(state: QrStudioState, gradient: StudioGradient) {
  return {
    ...state,
    dotsColorMode: "gradient" as const,
    dataModulesGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyDotsPaletteSelection(state: QrStudioState) {
  return {
    ...state,
    dotsColorMode: "palette" as const,
  }
}

export function applyCornerSolidColor(
  state: QrStudioState,
  cornerKey: DashboardCornerColorKey,
  color: string,
) {
  if (cornerKey === "cornersSquare") {
    return {
      ...state,
      finderPatternOuterSettings: {
        ...state.finderPatternOuterSettings,
        color,
      },
      finderPatternOuterGradient: {
        ...state.finderPatternOuterGradient,
        enabled: false,
      },
    }
  }

  return {
    ...state,
    finderPatternInnerSettings: {
      ...state.finderPatternInnerSettings,
      color,
    },
    finderPatternInnerGradient: {
      ...state.finderPatternInnerGradient,
      enabled: false,
    },
  }
}

export function applyCornerGradient(
  state: QrStudioState,
  cornerKey: DashboardCornerColorKey,
  gradient: StudioGradient,
) {
  if (cornerKey === "cornersSquare") {
    return {
      ...state,
      finderPatternOuterGradient: {
        ...gradient,
        enabled: true,
      },
    }
  }

  return {
    ...state,
    finderPatternInnerGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyBackgroundSolidColor(state: QrStudioState, color: string) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      color,
      transparent: false,
    },
    backgroundGradient: {
      ...state.backgroundGradient,
      enabled: false,
    },
  }
}

export function applyBackgroundGradient(
  state: QrStudioState,
  gradient: StudioGradient,
) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      transparent: false,
    },
    backgroundGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

export function applyBackgroundTransparentSelection(state: QrStudioState) {
  return {
    ...state,
    backgroundOptions: {
      ...state.backgroundOptions,
      transparent: true,
    },
    backgroundGradient: {
      ...state.backgroundGradient,
      enabled: false,
    },
  }
}

export function applyAssetNoneSelection(
  state: QrStudioState,
  assetKey: DashboardAssetKey,
) {
  return {
    ...state,
    [assetKey]: {
      presetColor: undefined,
      presetId: undefined,
      source: "none",
      value: undefined,
    },
  }
}

export function applyAssetUrlValue(
  state: QrStudioState,
  assetKey: DashboardAssetKey,
  value: string,
) {
  return {
    ...state,
    [assetKey]: {
      presetColor: undefined,
      presetId: undefined,
      source: "url",
      value,
    },
  }
}

export function applyLogoPresetSelection(
  state: QrStudioState,
  brandIcon: BrandIconEntry,
  value: string,
  presetColor: string,
) {
  return {
    ...state,
    logo: {
      presetColor,
      presetId: brandIcon.id as QrStudioState["logo"]["presetId"],
      source: "preset" as const,
      value,
    },
  }
}

export function applyLogoPresetColor(
  state: QrStudioState,
  value: string | undefined,
  presetColor: string,
) {
  return {
    ...state,
    logo: {
      ...state.logo,
      presetColor,
      source: "preset" as const,
      value,
    },
    logoGradient: {
      ...state.logoGradient,
      enabled: false,
    },
  }
}

export function applyLogoPresetGradient(
  state: QrStudioState,
  value: string | undefined,
  gradient: StudioGradient,
) {
  return {
    ...state,
    logo: {
      ...state.logo,
      source: "preset" as const,
      value,
    },
    logoGradient: {
      ...gradient,
      enabled: true,
    },
  }
}

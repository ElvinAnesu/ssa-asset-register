"use client"

// This component is now disabled - no banners will be shown
interface MockDataBannerProps {
  isVisible: boolean
  needsTableSetup?: boolean
  error?: string | null
}

export function MockDataBanner({ isVisible, needsTableSetup = false, error }: MockDataBannerProps) {
  // Always return null - no banners will be displayed
  return null
}

import { useCallback } from 'react'

import { exportSnapshot } from './snapshotExport.js'

export function useSnapshotExport({
  backgroundColor,
  devicePixelRatio,
  genus,
  includeCurve,
  includeGraph,
  includeTypeLabel,
  isKnownType,
  trimBorder,
  type,
  useCustomBackground,
}) {
  return useCallback(
    () =>
      exportSnapshot({
        backgroundColor,
        devicePixelRatio,
        genus,
        includeCurve,
        includeGraph,
        includeTypeLabel,
        isKnownType,
        trimBorder,
        type,
        useCustomBackground,
      }),
    [
      backgroundColor,
      devicePixelRatio,
      genus,
      includeCurve,
      includeGraph,
      includeTypeLabel,
      isKnownType,
      trimBorder,
      type,
      useCustomBackground,
    ],
  )
}

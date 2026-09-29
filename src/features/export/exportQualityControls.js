import { folder } from 'leva'

function getDefaultDevicePixelRatio() {
  if (typeof window === 'undefined') return 2
  return window.devicePixelRatio || 2
}

export function createExportQualityControlSchema() {
  return {
    'Export Quality': folder(
      {
        videoBitrate: {
          value: 15,
          min: 1,
          max: 100,
          step: 1,
          label: 'Video Bitrate (Mbps)',
        },
        renderDPR: {
          value: getDefaultDevicePixelRatio(),
          min: 1,
          max: 4,
          step: 0.5,
          label: 'Snapshot Quality',
        },
      },
      { collapsed: true, order: 3 },
    ),
  }
}

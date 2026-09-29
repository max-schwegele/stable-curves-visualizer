import { button, folder } from 'leva'

export function createCameraControlSchema({ copyView, selectPreset }) {
  const cameraControls = {
    Default: button(() => selectPreset('default')),
    Overview: button(() => selectPreset('overview')),
    Front: button(() => selectPreset('front')),
    Top: button(() => selectPreset('top')),
  }

  if (import.meta.env.DEV) {
    cameraControls['Copy Camera Data'] = button(copyView)
  }

  return {
    Camera: folder(
      cameraControls,
      { collapsed: true, order: 4 },
    ),
  }
}

import { folder } from 'leva'

import {
  DEFAULT_COMPONENT_COLORS_G2,
  DEFAULT_LOOP_COLORS_G2,
} from './paletteG2.js'

const PINCH_CONTROL = {
  value: 0,
  min: 0,
  max: 1,
  step: 0.01,
}

function createPinchControl(label) {
  return { ...PINCH_CONTROL, label }
}

function createMarkerColorControl(markerName, value) {
  return {
    value,
    label: ' ↳ Color',
    render: (get) => get(`Design G2.${markerName}_show`),
  }
}

export function createG2ControlSchema() {
  return {
    'Loop Pinches G2': folder(
      {
        H1: createPinchControl('H1'),
        H2: createPinchControl('H2'),
        E: createPinchControl('E'),
        B: createPinchControl('B'),
        showAll: { value: false, label: 'Mark All' },
      },
      { collapsed: true, order: 1 },
    ),
    'Design G2': folder(
      {
        color1: {
          value: DEFAULT_COMPONENT_COLORS_G2.primary,
          label: 'Color 1',
        },
        color2: {
          value: DEFAULT_COMPONENT_COLORS_G2.secondary,
          label: 'Color 2',
          render: (get) => !get('Design G2.uniformColor'),
        },
        uniformColor: { value: false, label: 'Single Color' },
        H1_show: { value: false, label: 'Mark H1' },
        H1_color: createMarkerColorControl('H1', DEFAULT_LOOP_COLORS_G2.H1),
        H2_show: { value: false, label: 'Mark H2' },
        H2_color: createMarkerColorControl('H2', DEFAULT_LOOP_COLORS_G2.H2),
        E_show: { value: false, label: 'Mark E' },
        E_color: createMarkerColorControl('E', DEFAULT_LOOP_COLORS_G2.E),
        B_show: { value: false, label: 'Mark B' },
        B_color: createMarkerColorControl('B', DEFAULT_LOOP_COLORS_G2.B),
      },
      { collapsed: true, order: 2 },
    ),
  }
}

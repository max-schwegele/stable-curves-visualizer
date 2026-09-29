import { folder } from 'leva'

import {
  DEFAULT_COMPONENT_COLORS_G3,
  DEFAULT_LOOP_COLORS_G3,
} from './paletteG3.js'

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
    render: (get) => get(`Design G3.${markerName}_show`),
  }
}

export function createG3ControlSchema() {
  return {
    'Loop Pinches G3': folder(
      {
        H1: createPinchControl('H1'),
        H2: createPinchControl('H2'),
        H3: createPinchControl('H3'),
        E1: createPinchControl('E1'),
        E2: createPinchControl('E2'),
        E3: createPinchControl('E3'),
        B12: createPinchControl('B12'),
        B13: createPinchControl('B13'),
        B23: createPinchControl('B23'),
        H1_star: createPinchControl('H1*'),
        showAll: { value: false, label: 'Mark All' },
      },
      { collapsed: true, order: 1 },
    ),
    'Design G3': folder(
      {
        color1: {
          value: DEFAULT_COMPONENT_COLORS_G3.primary,
          label: 'Color 1',
        },
        color2: {
          value: DEFAULT_COMPONENT_COLORS_G3.secondary,
          label: 'Color 2',
          render: (get) => !get('Design G3.uniformColor'),
        },
        color3: {
          value: DEFAULT_COMPONENT_COLORS_G3.tertiary,
          label: 'Color 3',
          render: (get) => !get('Design G3.uniformColor'),
        },
        color4: {
          value: DEFAULT_COMPONENT_COLORS_G3.quaternary,
          label: 'Color 4',
          render: (get) => !get('Design G3.uniformColor'),
        },
        uniformColor: { value: false, label: 'Single Color' },
        H1_show: { value: false, label: 'Mark H1' },
        H1_color: createMarkerColorControl('H1', DEFAULT_LOOP_COLORS_G3.H1),
        H2_show: { value: false, label: 'Mark H2' },
        H2_color: createMarkerColorControl('H2', DEFAULT_LOOP_COLORS_G3.H2),
        H3_show: { value: false, label: 'Mark H3' },
        H3_color: createMarkerColorControl('H3', DEFAULT_LOOP_COLORS_G3.H3),
        E1_show: { value: false, label: 'Mark E1' },
        E1_color: createMarkerColorControl('E1', DEFAULT_LOOP_COLORS_G3.E1),
        E2_show: { value: false, label: 'Mark E2' },
        E2_color: createMarkerColorControl('E2', DEFAULT_LOOP_COLORS_G3.E2),
        E3_show: { value: false, label: 'Mark E3' },
        E3_color: createMarkerColorControl('E3', DEFAULT_LOOP_COLORS_G3.E3),
        B12_show: { value: false, label: 'Mark B12' },
        B12_color: createMarkerColorControl('B12', DEFAULT_LOOP_COLORS_G3.B12),
        B13_show: { value: false, label: 'Mark B13' },
        B13_color: createMarkerColorControl('B13', DEFAULT_LOOP_COLORS_G3.B13),
        B23_show: { value: false, label: 'Mark B23' },
        B23_color: createMarkerColorControl('B23', DEFAULT_LOOP_COLORS_G3.B23),
        H1_star_show: { value: false, label: 'Mark H1*' },
        H1_star_color: createMarkerColorControl(
          'H1_star',
          DEFAULT_LOOP_COLORS_G3.H1_star,
        ),
      },
      { collapsed: true, order: 2 },
    ),
  }
}

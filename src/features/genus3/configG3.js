import { getPublicAssetUrl } from '../../shared/publicAssetUrl.js'

const SECTIONS = [
  {
    id: 'page1',
    title: 'Core Irred',
    subgroups: [
      { label: '0 1-Tail', items: ['3', '2n', '1nn', '0nnn'] },
      { label: '1 1-Tail', items: ['2e', '2m', '1ne', '1nm', '0nne', '0nnm'] },
      { label: '2 1-Tail', items: ['1ee', '1me', '1mm', '0nee', '0nme', '0nmm'] },
      { label: '3 1-Tail', items: ['0eee', '0mee', '0mme', '0mmm'] },
    ],
  },
  {
    id: 'page2',
    title: '2-Insep & Red',
    subgroups: [
      { label: '0 1-Tail', items: ['1---0', '0---0n', '0----0', 'CAVE', 'BRAID'] },
      { label: '1 1-Tail', items: ['0---0e', '0---0m'] },
    ],
  },
  {
    id: 'page3',
    title: '2-Sep & 2-Comp',
    subgroups: [
      { label: '0 1-Tail', items: ['1=1', '1=0n', '0n=0n'] },
      { label: '1 1-Tail', items: ['1=0e', '1=0m', '0n=0e', '0n=0m'] },
      { label: '2 1-Tail', items: ['0e=0e', '0m=0e', '0m=0m'] },
    ],
  },
  {
    id: 'page4',
    title: '2-Sep & ≥3-Comp',
    subgroups: [
      { label: '0 1-Tail', items: ['Z=1', 'Z=0n', 'Z=Z'] },
      { label: '1 1-Tail', items: ['Z=0e', 'Z=0m'] },
    ],
  },
]

const TYPES = SECTIONS.flatMap((section) =>
  section.subgroups.flatMap((subgroup) => subgroup.items),
)

export const GENUS_3_DATA = {
  TYPES,
  DEFAULT_TOUR: [...TYPES, TYPES[0]],
  DEFAULT_TYPE: TYPES[0],
  MODEL_URL: getPublicAssetUrl('models/surface_g3.glb'),
  SECTIONS,
}

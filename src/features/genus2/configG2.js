import { TYPES_G2 } from './topologyG2.js'
import { getPublicAssetUrl } from '../../shared/publicAssetUrl.js'

export const GENUS_2_DATA = {
  TYPES: TYPES_G2,
  DEFAULT_TOUR: ['2', '1n', '0nn', '0---0', 'mm', 'me', 'ee', '2'],
  DEFAULT_TYPE: '2',
  MODEL_URL: getPublicAssetUrl('models/surface_g2.glb'),
}

import assert from 'node:assert/strict'
import test from 'node:test'

import { getPublicAssetUrl } from '../src/shared/publicAssetUrl.js'

test('public asset paths default to the site root outside Vite', () => {
  assert.equal(getPublicAssetUrl('models/surface_g2.glb'), '/models/surface_g2.glb')
})

test('public asset paths include the configured deployment base', () => {
  assert.equal(
    getPublicAssetUrl('/diagrams/genus-3/graphs/graph_3.svg', '/stable-curves-visualizer/'),
    '/stable-curves-visualizer/diagrams/genus-3/graphs/graph_3.svg',
  )
})

test('deployment bases are normalized with a trailing slash', () => {
  assert.equal(
    getPublicAssetUrl('favicon.ico', '/stable-curves-visualizer'),
    '/stable-curves-visualizer/favicon.ico',
  )
})

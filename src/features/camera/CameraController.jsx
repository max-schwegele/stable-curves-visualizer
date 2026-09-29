import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useControls } from 'leva'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { createCameraControlSchema } from './cameraControls.js'
import { getCameraPreset, serializeCameraView } from './cameraPresets.js'

const CAMERA_TRANSITION_DURATION = 0.8

export default function CameraController({ genus }) {
  const camera = useThree((state) => state.camera)
  const controlsRef = useRef(null)
  const transitionRef = useRef(null)
  const previousGenusRef = useRef(null)

  const selectPreset = useCallback(
    (presetName) => {
      const controls = controlsRef.current
      if (!controls) return

      transitionRef.current?.kill()

      const preset = getCameraPreset(genus, presetName)
      const startPosition = camera.position.clone()
      const startTarget = controls.target.clone()
      const endPosition = startPosition.clone().fromArray(preset.position)
      const endTarget = startTarget.clone().fromArray(preset.target)
      const progress = { value: 0 }

      transitionRef.current = gsap.to(progress, {
        value: 1,
        duration: CAMERA_TRANSITION_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.lerpVectors(
            startPosition,
            endPosition,
            progress.value,
          )
          controls.target.lerpVectors(startTarget, endTarget, progress.value)
          controls.update()
        },
        onComplete: () => {
          transitionRef.current = null
        },
      })
    },
    [camera, genus],
  )

  const copyCurrentView = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return

    const serializedView = serializeCameraView(
      genus,
      camera.position.toArray(),
      controls.target.toArray(),
    )

    if (navigator.clipboard) {
      navigator.clipboard.writeText(serializedView).catch(() => {
        window.prompt('Copy camera view', serializedView)
      })
      return
    }

    window.prompt('Copy camera view', serializedView)
  }, [camera, genus])

  useControls(
    () => createCameraControlSchema({ copyView: copyCurrentView, selectPreset }),
    [copyCurrentView, selectPreset],
  )

  useLayoutEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    if (previousGenusRef.current === null) {
      const preset = getCameraPreset(genus, 'default')
      camera.position.fromArray(preset.position)
      controls.target.fromArray(preset.target)
      controls.update()
    } else if (previousGenusRef.current !== genus) {
      selectPreset('default')
    }

    previousGenusRef.current = genus
  }, [camera, genus, selectPreset])

  useEffect(
    () => () => {
      transitionRef.current?.kill()
    },
    [],
  )

  return (
    <OrbitControls
      makeDefault
      onStart={() => {
        transitionRef.current?.kill()
        transitionRef.current = null
      }}
      ref={controlsRef}
    />
  )
}

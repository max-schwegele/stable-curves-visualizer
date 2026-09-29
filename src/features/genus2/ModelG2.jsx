import { useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'

import { GENUS_DATA } from '../../config.js'
import { useLevaControlRowStyle } from '../../shared/useLevaControlRowStyle.js'
import { useMarkerVisibilitySync } from '../../shared/useMarkerVisibilitySync.js'
import { createG2ControlSchema } from './controlsG2.js'
import { updateG2Scene } from './renderingG2.js'
import {
  ALL_LOOPS_G2,
  classifyG2State,
  findOptimalTransitionG2,
  getConflictingLoopsToOpenG2,
  loopValuesToState,
  stateToLoopValues,
} from './topologyG2.js'

export default function ModelG2({
  clickTarget,
  isAnimating,
  isTourActive,
  onAnimatingChange,
  onStartRecording,
  onStopRecording,
  onTourActiveChange,
  onTypeChange,
  tourSequence,
  tourTrigger,
}) {
  const { scene: originalScene } = useGLTF(GENUS_DATA[2].MODEL_URL)
  const scene = useMemo(() => originalScene.clone(), [originalScene])

  const [
    {
      H1,
      H2,
      E,
      B,
      showAll,
      color1,
      color2,
      uniformColor,
      H1_show,
      H1_color,
      H2_show,
      H2_color,
      E_show,
      E_color,
      B_show,
      B_color,
    },
    setControls,
  ] = useControls(createG2ControlSchema)

  const previousLoopValuesRef = useRef({ E: 0, B: 0 })
  const latestLoopValuesRef = useRef({ H1, H2, E, B })
  const activeTimelineRef = useRef(null)

  const latestTourSequenceRef = useRef(tourSequence)
  const latestOnStartRecordingRef = useRef(onStartRecording)
  const latestOnStopRecordingRef = useRef(onStopRecording)

  useEffect(() => {
    latestLoopValuesRef.current = { H1, H2, E, B }
  }, [H1, H2, E, B])

  useEffect(() => {
    latestTourSequenceRef.current = tourSequence
  }, [tourSequence])

  useEffect(() => {
    latestOnStartRecordingRef.current = onStartRecording
    latestOnStopRecordingRef.current = onStopRecording
  }, [onStartRecording, onStopRecording])

  const markerVisibility = useMemo(
    () => ({
      H1_show,
      H2_show,
      E_show,
      B_show,
    }),
    [B_show, E_show, H1_show, H2_show],
  )

  useMarkerVisibilitySync({
    markerVisibility,
    setControls,
    showAll,
  })

  useLevaControlRowStyle('H1', H1_show, H1_color, isTourActive)
  useLevaControlRowStyle('H2', H2_show, H2_color, isTourActive)
  useLevaControlRowStyle('E', E_show, E_color, isTourActive)
  useLevaControlRowStyle('B', B_show, B_color, isTourActive)

  useEffect(() => {
    if (!tourTrigger) return

    const sequence = latestTourSequenceRef.current
    if (!sequence || sequence.length === 0) return

    activeTimelineRef.current?.kill()

    const animatedValues = { ...latestLoopValuesRef.current }
    const simulatedValues = { ...latestLoopValuesRef.current }
    let currentState = loopValuesToState(simulatedValues)

    const updateLoopControls = () => {
      setControls({
        H1: animatedValues.H1,
        H2: animatedValues.H2,
        E: animatedValues.E,
        B: animatedValues.B,
      })
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        onAnimatingChange(false)
        onTourActiveChange(false)
        latestOnStopRecordingRef.current?.()
      },
    })
    activeTimelineRef.current = timeline

    sequence.forEach((type, index) => {
      if (index === 0) {
        timeline.call(() => latestOnStartRecordingRef.current?.())
      }

      const transition = findOptimalTransitionG2(currentState, type)
      const target = transition.options[0]
      if (!target) return

      const targetValues = stateToLoopValues(target.targetState)
      const openValues = {}
      const closeValues = {}

      for (const loop of ALL_LOOPS_G2) {
        if (targetValues[loop] === 0 && simulatedValues[loop] > 0) {
          openValues[loop] = 0
        } else if (targetValues[loop] === 1 && simulatedValues[loop] < 1) {
          closeValues[loop] = 1
        }
        simulatedValues[loop] = targetValues[loop]
      }

      timeline.call(() => onTypeChange(type))

      if (Object.keys(openValues).length > 0) {
        timeline.to(animatedValues, {
          ...openValues,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: updateLoopControls,
        })
      }

      if (Object.keys(closeValues).length > 0) {
        timeline.to(animatedValues, {
          ...closeValues,
          duration: 0.6,
          ease: 'power2.inOut',
          onUpdate: updateLoopControls,
        })
      }

      timeline.to({}, { duration: 0.8 })
      currentState = target.targetState
    })

    return () => timeline.kill()
  }, [
    onAnimatingChange,
    onTourActiveChange,
    onTypeChange,
    setControls,
    tourTrigger,
  ])

  useEffect(() => {
    if (!clickTarget) return

    activeTimelineRef.current?.kill()

    const currentState = loopValuesToState(latestLoopValuesRef.current)
    const transition = findOptimalTransitionG2(
      currentState,
      clickTarget.type,
    )
    const target = transition.options[0]

    if (!target) {
      onAnimatingChange(false)
      return
    }

    const targetValues = stateToLoopValues(target.targetState)
    const animatedValues = { ...latestLoopValuesRef.current }
    const openValues = {}
    const closeValues = {}

    for (const loop of ALL_LOOPS_G2) {
      if (targetValues[loop] === 0 && animatedValues[loop] > 0) {
        openValues[loop] = 0
      } else if (targetValues[loop] === 1 && animatedValues[loop] < 1) {
        closeValues[loop] = 1
      }
    }

    const updateLoopControls = () => {
      setControls({
        H1: animatedValues.H1,
        H2: animatedValues.H2,
        E: animatedValues.E,
        B: animatedValues.B,
      })
    }
    const timeline = gsap.timeline({
      onComplete: () => onAnimatingChange(false),
    })
    activeTimelineRef.current = timeline

    if (Object.keys(openValues).length > 0) {
      timeline.to(animatedValues, {
        ...openValues,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: updateLoopControls,
      })
    }

    if (Object.keys(closeValues).length > 0) {
      timeline.to(animatedValues, {
        ...closeValues,
        duration: 0.6,
        ease: 'power2.inOut',
        onUpdate: updateLoopControls,
      })
    }

    if (
      Object.keys(openValues).length === 0 &&
      Object.keys(closeValues).length === 0
    ) {
      onAnimatingChange(false)
    }

    return () => timeline.kill()
  }, [clickTarget, onAnimatingChange, setControls])

  useEffect(() => {
    const currentLoopValues = { H1, H2, E, B }
    const loopsToOpen = getConflictingLoopsToOpenG2(
      previousLoopValuesRef.current,
      currentLoopValues,
    )
    const resolvedLoopValues = { ...currentLoopValues }

    if (loopsToOpen.length > 0) {
      setControls(
        Object.fromEntries(loopsToOpen.map((loop) => [loop, 0])),
      )
      for (const loop of loopsToOpen) {
        resolvedLoopValues[loop] = 0
      }
    }
    previousLoopValuesRef.current = { E, B }

    if (!isAnimating) {
      const state = loopValuesToState(resolvedLoopValues, 0.95)
      const type = classifyG2State(state)
      onTypeChange(type === 'UNKNOWN' ? 'Transition...' : type)
    }

    const markerStyles = {
      H1: { visible: H1_show, color: H1_color },
      H2: { visible: H2_show, color: H2_color },
      E: { visible: E_show, color: E_color },
      B: { visible: B_show, color: B_color },
    }

    updateG2Scene(scene, {
      baseColor: color1,
      loopValues: resolvedLoopValues,
      markerStyles,
      secondaryColor: color2,
      uniformColor,
    })
  }, [
    scene,
    H1,
    H2,
    E,
    B,
    color1,
    color2,
    uniformColor,
    H1_show,
    H1_color,
    H2_show,
    H2_color,
    E_show,
    E_color,
    B_show,
    B_color,
    onTypeChange,
    setControls,
    isAnimating,
  ])

  useEffect(() => {
    if (!isAnimating) activeTimelineRef.current?.kill()
  }, [isAnimating])

  return <primitive object={scene} dispose={null} />
}

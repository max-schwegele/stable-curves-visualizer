import { useGLTF } from '@react-three/drei'
import { gsap } from 'gsap'
import { useControls } from 'leva'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { GENUS_DATA } from '../../config.js'
import { useLevaControlRowStyle } from '../../shared/useLevaControlRowStyle.js'
import { useMarkerVisibilitySync } from '../../shared/useMarkerVisibilitySync.js'
import { ContinuousGraphColoring } from './continuousGraphColoring.js'
import { createG3ControlSchema } from './controlsG3.js'
import { updateG3Scene } from './renderingG3.js'
import {
  ALL_LOOPS_G3,
  classifyG3,
  findOptimalTransitionG3,
  getConflictingLoopsToOpenG3,
} from './topologyG3.js'

function getCurrentActiveLoopNames(values) {
  return ALL_LOOPS_G3.filter((name) => values[name] > 0.5)
}

export default function ModelG3({
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
  const { scene: originalScene } = useGLTF(GENUS_DATA[3].MODEL_URL)
  const scene = useMemo(() => originalScene.clone(), [originalScene])

  const [
    {
      H1,
      H2,
      H3,
      E1,
      E2,
      E3,
      B12,
      B13,
      B23,
      H1_star,
      showAll,
      color1,
      color2,
      color3,
      color4,
      uniformColor,
      H1_show,
      H1_color,
      H2_show,
      H2_color,
      H3_show,
      H3_color,
      E1_show,
      E1_color,
      E2_show,
      E2_color,
      E3_show,
      E3_color,
      B12_show,
      B12_color,
      B13_show,
      B13_color,
      B23_show,
      B23_color,
      H1_star_show,
      H1_star_color,
    },
    setControls,
  ] = useControls(createG3ControlSchema)

  const previousLoopValuesRef = useRef({
    E1: 0,
    E2: 0,
    E3: 0,
    B12: 0,
    B13: 0,
    B23: 0,
    H1_star: 0,
  })
  const latestLoopValuesRef = useRef({
    H1,
    H2,
    H3,
    E1,
    E2,
    E3,
    B12,
    B13,
    B23,
    H1_star,
  })

  useEffect(() => {
    latestLoopValuesRef.current = {
      H1,
      H2,
      H3,
      E1,
      E2,
      E3,
      B12,
      B13,
      B23,
      H1_star,
    }
  }, [H1, H2, H3, E1, E2, E3, B12, B13, B23, H1_star])

  const componentColoringRef = useRef(null)

  useEffect(() => {
    const componentColors = uniformColor ? [] : [color2, color3, color4]
    componentColoringRef.current = new ContinuousGraphColoring(
      color1,
      componentColors,
    )
  }, [color1, color2, color3, color4, uniformColor])

  const activeTimelineRef = useRef(null)
  const activeStepTimelineRef = useRef(null)

  const latestTourSequenceRef = useRef(tourSequence)
  const latestOnStartRecordingRef = useRef(onStartRecording)
  const latestOnStopRecordingRef = useRef(onStopRecording)

  useEffect(() => {
    latestTourSequenceRef.current = tourSequence
  }, [tourSequence])

  useEffect(() => {
    latestOnStartRecordingRef.current = onStartRecording
    latestOnStopRecordingRef.current = onStopRecording
  }, [onStartRecording, onStopRecording])

  const updateLoopControls = useCallback(
    (values) => {
      setControls({
        H1: values.H1,
        H2: values.H2,
        H3: values.H3,
        E1: values.E1,
        E2: values.E2,
        E3: values.E3,
        B12: values.B12,
        B13: values.B13,
        B23: values.B23,
        H1_star: values.H1_star,
      })
    },
    [setControls],
  )

  const markerVisibility = useMemo(
    () => ({
      H1_show,
      H2_show,
      H3_show,
      E1_show,
      E2_show,
      E3_show,
      B12_show,
      B13_show,
      B23_show,
      H1_star_show,
    }),
    [
      B12_show,
      B13_show,
      B23_show,
      E1_show,
      E2_show,
      E3_show,
      H1_show,
      H1_star_show,
      H2_show,
      H3_show,
    ],
  )

  useMarkerVisibilitySync({
    markerVisibility,
    setControls,
    showAll,
  })

  useLevaControlRowStyle('H1', H1_show, H1_color, isTourActive)
  useLevaControlRowStyle('H2', H2_show, H2_color, isTourActive)
  useLevaControlRowStyle('H3', H3_show, H3_color, isTourActive)
  useLevaControlRowStyle('E1', E1_show, E1_color, isTourActive)
  useLevaControlRowStyle('E2', E2_show, E2_color, isTourActive)
  useLevaControlRowStyle('E3', E3_show, E3_color, isTourActive)
  useLevaControlRowStyle('B12', B12_show, B12_color, isTourActive)
  useLevaControlRowStyle('B13', B13_show, B13_color, isTourActive)
  useLevaControlRowStyle('B23', B23_show, B23_color, isTourActive)
  useLevaControlRowStyle(
    'H1*',
    H1_star_show,
    H1_star_color,
    isTourActive,
  )

  useEffect(() => {
    const currentLoopValues = {
      E1,
      E2,
      E3,
      B12,
      B13,
      B23,
      H1_star,
    }
    const loopsToOpen = getConflictingLoopsToOpenG3(
      previousLoopValuesRef.current,
      currentLoopValues,
    )

    if (loopsToOpen.length > 0) {
      setControls(
        Object.fromEntries(loopsToOpen.map((loop) => [loop, 0])),
      )
    }

    previousLoopValuesRef.current = currentLoopValues
  }, [E1, E2, E3, B12, B13, B23, H1_star, setControls])

  useEffect(() => {
    if (!isTourActive || !isAnimating) {
      if (activeTimelineRef.current) activeTimelineRef.current.kill()
      if (activeStepTimelineRef.current) activeStepTimelineRef.current.kill()
    }
  }, [isTourActive, isAnimating])

  useEffect(() => {
    if (!tourTrigger) return

    const sequence = latestTourSequenceRef.current
    if (!sequence || sequence.length === 0) return
    activeTimelineRef.current?.kill()

    const timeline = gsap.timeline({
      onComplete: () => {
        onAnimatingChange(false)
        onTourActiveChange(false)
        latestOnStopRecordingRef.current?.()
      },
    })
    activeTimelineRef.current = timeline
    const animatedValues = { ...latestLoopValuesRef.current }

    sequence.forEach((targetType, index) => {
      timeline.call(() => {
        onTypeChange(targetType)

        const currentActiveLoops = getCurrentActiveLoopNames(animatedValues)
        const transition = findOptimalTransitionG3(
          currentActiveLoops,
          targetType,
        )

        if (!transition.error && transition.options.length > 0) {
          const transitionOption = transition.options[0]

          activeStepTimelineRef.current?.kill()

          const stepTimeline = gsap.timeline()
          activeStepTimelineRef.current = stepTimeline

          const openValues = {}
          const closeValues = {}

          ALL_LOOPS_G3.forEach((loopName) => {
            if (
              !transitionOption.targetLoops.includes(loopName) &&
              animatedValues[loopName] > 0
            ) {
              openValues[loopName] = 0
            }
            if (
              transitionOption.targetLoops.includes(loopName) &&
              animatedValues[loopName] < 1
            ) {
              closeValues[loopName] = 1
            }
          })

          if (Object.keys(openValues).length > 0) {
            stepTimeline.to(animatedValues, {
              ...openValues,
              duration: 0.5,
              ease: 'power2.out',
              onUpdate: () => updateLoopControls(animatedValues),
            })
          }

          if (Object.keys(closeValues).length > 0) {
            stepTimeline.to(animatedValues, {
              ...closeValues,
              duration: 0.6,
              ease: 'power2.inOut',
              onUpdate: () => updateLoopControls(animatedValues),
            })
          }
        }
      })

      if (index === 0) {
        timeline.call(() => latestOnStartRecordingRef.current?.())
      }
      timeline.to({}, { duration: 1.2 })
    })

    return () => {
      timeline.kill()
      activeStepTimelineRef.current?.kill()
    }
  }, [
    onAnimatingChange,
    onTourActiveChange,
    onTypeChange,
    tourTrigger,
    updateLoopControls,
  ])

  useEffect(() => {
    if (!clickTarget) return
    activeTimelineRef.current?.kill()
    activeStepTimelineRef.current?.kill()

    const animatedValues = { ...latestLoopValuesRef.current }
    const currentActiveLoops = getCurrentActiveLoopNames(animatedValues)
    const transition = findOptimalTransitionG3(
      currentActiveLoops,
      clickTarget.type,
    )

    if (transition.error || transition.options.length === 0) {
      onAnimatingChange(false)
      return
    }

    const transitionOption = transition.options[0]
    const timeline = gsap.timeline({
      onComplete: () => onAnimatingChange(false),
    })
    activeTimelineRef.current = timeline

    const openValues = {}
    const closeValues = {}

    ALL_LOOPS_G3.forEach((loopName) => {
      if (
        !transitionOption.targetLoops.includes(loopName) &&
        animatedValues[loopName] > 0
      ) {
        openValues[loopName] = 0
      }
      if (
        transitionOption.targetLoops.includes(loopName) &&
        animatedValues[loopName] < 1
      ) {
        closeValues[loopName] = 1
      }
    })

    if (Object.keys(openValues).length > 0) {
      timeline.to(animatedValues, {
        ...openValues,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => updateLoopControls(animatedValues),
      })
    }

    if (Object.keys(closeValues).length > 0) {
      timeline.to(animatedValues, {
        ...closeValues,
        duration: 0.6,
        ease: 'power2.inOut',
        onUpdate: () => updateLoopControls(animatedValues),
      })
    }

    return () => timeline.kill()
  }, [clickTarget, onAnimatingChange, updateLoopControls])

  useEffect(() => {
    if (!isAnimating) {
      const currentActiveLoops = ALL_LOOPS_G3.filter(
        (name) => latestLoopValuesRef.current[name] > 0.95,
      )
      const currentType = classifyG3(currentActiveLoops)
      onTypeChange(currentType)
    }

    const currentLoops = { H1, H2, H3, E1, E2, E3, B12, B13, B23, H1_star }
    let componentColorMap = null
    if (componentColoringRef.current) {
      componentColorMap = componentColoringRef.current.update(
        currentLoops,
        !uniformColor,
      )
    }

    const markerStyles = {
      H1: { visible: H1_show, color: H1_color },
      H2: { visible: H2_show, color: H2_color },
      H3: { visible: H3_show, color: H3_color },
      E1: { visible: E1_show, color: E1_color },
      E2: { visible: E2_show, color: E2_color },
      E3: { visible: E3_show, color: E3_color },
      B12: { visible: B12_show, color: B12_color },
      B13: { visible: B13_show, color: B13_color },
      B23: { visible: B23_show, color: B23_color },
      H1_star: { visible: H1_star_show, color: H1_star_color },
    }

    updateG3Scene(scene, {
      baseColor: color1,
      componentColorMap,
      loopValues: currentLoops,
      markerStyles,
      uniformColor,
    })
  }, [
    B12,
    B12_color,
    B12_show,
    B13,
    B13_color,
    B13_show,
    B23,
    B23_color,
    B23_show,
    E1,
    E1_color,
    E1_show,
    E2,
    E2_color,
    E2_show,
    E3,
    E3_color,
    E3_show,
    H1,
    H1_color,
    H1_show,
    H1_star,
    H1_star_color,
    H1_star_show,
    H2,
    H2_color,
    H2_show,
    H3,
    H3_color,
    H3_show,
    color1,
    color2,
    color3,
    color4,
    isAnimating,
    onTypeChange,
    scene,
    uniformColor,
  ])

  return <primitive object={scene} dispose={null} />
}

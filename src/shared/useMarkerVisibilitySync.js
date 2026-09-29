import { useEffect, useRef } from 'react'

function createHiddenMarkerState(controlNames) {
  return Object.fromEntries(controlNames.map((name) => [name, false]))
}

export function useMarkerVisibilitySync({
  markerVisibility,
  setControls,
  showAll,
}) {
  const previousStateRef = useRef({
    showAll: false,
    markerVisibility: createHiddenMarkerState(Object.keys(markerVisibility)),
  })
  const skipNextSyncRef = useRef(false)

  useEffect(() => {
    const currentState = { showAll, markerVisibility }

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      previousStateRef.current = currentState
      return
    }

    const showAllChanged = showAll !== previousStateRef.current.showAll
    const individualMarkerChanged = Object.entries(markerVisibility).some(
      ([name, isVisible]) =>
        isVisible !== previousStateRef.current.markerVisibility[name],
    )

    if (showAllChanged) {
      skipNextSyncRef.current = true
      setControls(
        Object.fromEntries(
          Object.keys(markerVisibility).map((name) => [name, showAll]),
        ),
      )
    } else if (individualMarkerChanged) {
      const everyMarkerVisible = Object.values(markerVisibility).every(Boolean)
      if (showAll !== everyMarkerVisible) {
        skipNextSyncRef.current = true
        setControls({ showAll: everyMarkerVisible })
      }
    }

    previousStateRef.current = currentState
  }, [markerVisibility, setControls, showAll])
}

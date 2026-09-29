import { useCallback, useState } from 'react'

import { GENUS_DATA } from '../../config.js'
import { parseTourSequence } from './tourSequence.js'

function getDefaultTour(genus) {
  return [...GENUS_DATA[genus].DEFAULT_TOUR]
}

export function useTourSequence(initialGenus) {
  const [rawInput, setRawInput] = useState(() =>
    getDefaultTour(initialGenus).join(', '),
  )
  const [tourSequence, setTourSequence] = useState(() =>
    getDefaultTour(initialGenus),
  )
  const [inputError, setInputError] = useState('')

  const updateTourInput = useCallback((text, genus) => {
    setRawInput(text)

    const result = parseTourSequence(
      text,
      GENUS_DATA[genus].TYPES,
      genus,
    )

    setInputError(result.error)
    if (result.sequence) setTourSequence(result.sequence)
  }, [])

  const resetTourSequence = useCallback((genus) => {
    const defaultTour = getDefaultTour(genus)
    setRawInput(defaultTour.join(', '))
    setTourSequence(defaultTour)
    setInputError('')
  }, [])

  return {
    hasInputError: inputError.length > 0,
    inputError,
    rawInput,
    resetTourSequence,
    tourSequence,
    updateTourInput,
  }
}

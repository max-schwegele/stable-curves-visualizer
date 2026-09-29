export function parseTourSequence(text, allowedTypes, genus) {
  const sequence = text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (sequence.length === 0) {
    return {
      error: 'Tour sequence cannot be empty!',
      sequence: null,
    }
  }

  const isValid = sequence.every((type) => allowedTypes.includes(type))
  if (!isValid) {
    return {
      error: `Syntax Error! Allowed types for G${genus}: ${allowedTypes.join(', ')}`,
      sequence: null,
    }
  }

  return { error: '', sequence }
}

import { useEffect } from 'react'

function findLevaControlLabel(label) {
  const elements = Array.from(document.querySelectorAll('label, div, span'))
  return elements.find(
    (element) =>
      element.textContent.trim() === label && element.children.length === 0,
  )
}

export function useLevaControlRowStyle(
  label,
  isHighlighted,
  highlightColor,
  isDisabled,
) {
  useEffect(() => {
    const applyRowStyle = () => {
      const targetLabel = findLevaControlLabel(label)
      if (!targetLabel) return

      targetLabel.style.color = isHighlighted ? highlightColor : ''
      targetLabel.style.fontWeight = isHighlighted ? 'bold' : 'normal'

      let row = targetLabel.parentElement
      while (row && !row.querySelector('input')) {
        row = row.parentElement
      }
      if (!row) return

      row.style.pointerEvents = isDisabled ? 'none' : 'auto'
      row.style.opacity = isDisabled ? '0.5' : '1'

      const numberInput = row.querySelector('input[type="number"]')
      if (numberInput) {
        numberInput.style.color = isHighlighted ? highlightColor : ''
        numberInput.style.fontWeight = isHighlighted ? 'bold' : 'normal'
      }

      const rangeInput = row.querySelector('input[type="range"]')
      const fillBar = rangeInput?.parentElement?.querySelector('div')
      if (fillBar) {
        fillBar.style.backgroundColor = isHighlighted ? highlightColor : ''
      }
    }

    applyRowStyle()

    const observer = new MutationObserver(applyRowStyle)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [highlightColor, isDisabled, isHighlighted, label])
}

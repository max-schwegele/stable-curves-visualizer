import { useState } from 'react'

import './ExportPanel.css'

function Checkbox({ checked, children, onChange }) {
  return (
    <label className="export-panel__checkbox">
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {children}
    </label>
  )
}

export default function ExportPanel({
  backgroundColor,
  includeCurve,
  includeGraph,
  includeTypeLabel,
  onBackgroundColorChange,
  onExport,
  onIncludeCurveChange,
  onIncludeGraphChange,
  onIncludeTypeLabelChange,
  onTrimBorderChange,
  onUseCustomBackgroundChange,
  trimBorder,
  useCustomBackground,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="export-panel">
      <button
        className="export-panel__save-button"
        onClick={onExport}
        type="button"
      >
        📸 Save Snapshot
      </button>

      <button
        aria-expanded={isSettingsOpen}
        className="export-panel__settings-toggle"
        onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        type="button"
      >
        {isSettingsOpen ? '⚙ Hide Options' : '⚙ Snapshot Settings...'}
      </button>

      {isSettingsOpen && (
        <div className="export-panel__settings">
          <Checkbox checked={trimBorder} onChange={onTrimBorderChange}>
            Crop borders
          </Checkbox>
          <Checkbox
            checked={includeTypeLabel}
            onChange={onIncludeTypeLabelChange}
          >
            Overlay label
          </Checkbox>

          <hr className="export-panel__divider" />

          <Checkbox
            checked={useCustomBackground}
            onChange={onUseCustomBackgroundChange}
          >
            Custom background
          </Checkbox>

          {useCustomBackground && (
            <label className="export-panel__color-control">
              <span className="export-panel__visually-hidden">
                Snapshot background color
              </span>
              <input
                className="export-panel__color-input"
                onChange={(event) =>
                  onBackgroundColorChange(event.target.value)
                }
                type="color"
                value={backgroundColor}
              />
              <span className="export-panel__color-value">
                {backgroundColor.toUpperCase()}
              </span>
            </label>
          )}

          <hr className="export-panel__divider" />

          <div className="export-panel__section-heading">EMBED 2D INLAYS</div>
          <Checkbox checked={includeCurve} onChange={onIncludeCurveChange}>
            Include curve sketch
          </Checkbox>
          <Checkbox checked={includeGraph} onChange={onIncludeGraphChange}>
            Include dual graph
          </Checkbox>
        </div>
      )}
    </div>
  )
}

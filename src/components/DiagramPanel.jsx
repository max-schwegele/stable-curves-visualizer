import {
  getCurveDiagramUrl,
  getGraphDiagramUrl,
} from '../shared/diagramUrls.js'

import './DiagramPanel.css'

function DiagramToggleButtons({
  showCurve,
  showGraph,
  onToggleCurve,
  onToggleGraph,
}) {
  return (
    <div className="diagram-panel__toggles">
      <button
        aria-pressed={showCurve}
        className={`diagram-panel__toggle${showCurve ? ' is-active' : ''}`}
        onClick={onToggleCurve}
        type="button"
      >
        {showCurve ? '✕ Sketch' : '👁 Sketch'}
      </button>
      <button
        aria-pressed={showGraph}
        className={`diagram-panel__toggle${showGraph ? ' is-active' : ''}`}
        onClick={onToggleGraph}
        type="button"
      >
        {showGraph ? '✕ Graph' : '👁 Graph'}
      </button>
    </div>
  )
}

function DiagramImage({ genus, type, variant }) {
  const isCurve = variant === 'curve'
  const title = isCurve ? 'SCHEMATIC CURVE' : 'DUAL GRAPH'
  const source = isCurve
    ? getCurveDiagramUrl(genus, type)
    : getGraphDiagramUrl(genus, type)

  return (
    <div className="diagram-panel__image-card">
      <div className="diagram-panel__image-title">{title}</div>
      <img
        alt={`${isCurve ? 'Schematic curve' : 'Dual graph'} for type ${type}`}
        className="diagram-panel__image"
        src={source}
      />
    </div>
  )
}

export function MobileDiagramControls({
  showCurve,
  showGraph,
  onToggleCurve,
  onToggleGraph,
}) {
  return (
    <div className="diagram-panel diagram-panel--mobile-controls">
      <div className="diagram-panel__heading">2D VISUALIZATION</div>
      <DiagramToggleButtons
        onToggleCurve={onToggleCurve}
        onToggleGraph={onToggleGraph}
        showCurve={showCurve}
        showGraph={showGraph}
      />
    </div>
  )
}

export function DesktopDiagramPanel({
  genus,
  type,
  isKnownType,
  showCurve,
  showGraph,
  onToggleCurve,
  onToggleGraph,
}) {
  const hasVisibleDiagram = showCurve || showGraph

  return (
    <div className="diagram-panel diagram-panel--desktop">
      <div className="diagram-panel__heading">2D VISUALIZATION</div>
      <DiagramToggleButtons
        onToggleCurve={onToggleCurve}
        onToggleGraph={onToggleGraph}
        showCurve={showCurve}
        showGraph={showGraph}
      />

      {isKnownType ? (
        <div className="diagram-panel__images">
          {showCurve && (
            <DiagramImage genus={genus} type={type} variant="curve" />
          )}
          {showGraph && (
            <DiagramImage genus={genus} type={type} variant="graph" />
          )}
        </div>
      ) : (
        hasVisibleDiagram && (
          <div className="diagram-panel__pending">Computing topology...</div>
        )
      )}
    </div>
  )
}

export function MobileDiagramOverlay({
  genus,
  type,
  isKnownType,
  showCurve,
  showGraph,
}) {
  if (!isKnownType || (!showCurve && !showGraph)) return null

  return (
    <div className="mobile-diagram-overlay">
      {showCurve && (
        <div className="mobile-diagram-overlay__card">
          <div className="mobile-diagram-overlay__title">SCHEMATIC</div>
          <img
            alt={`Schematic curve for type ${type}`}
            className="mobile-diagram-overlay__image"
            src={getCurveDiagramUrl(genus, type)}
          />
        </div>
      )}
      {showGraph && (
        <div className="mobile-diagram-overlay__card">
          <div className="mobile-diagram-overlay__title">DUAL GRAPH</div>
          <img
            alt={`Dual graph for type ${type}`}
            className="mobile-diagram-overlay__image"
            src={getGraphDiagramUrl(genus, type)}
          />
        </div>
      )}
    </div>
  )
}

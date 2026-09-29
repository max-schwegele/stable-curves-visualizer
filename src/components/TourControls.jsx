import { useState } from 'react'

import './TourControls.css'

function VideoSettings({
  backgroundColor,
  onBackgroundColorChange,
  onTrimBorderChange,
  onUseCustomBackgroundChange,
  trimBorder,
  useCustomBackground,
}) {
  return (
    <div className="tour-controls__settings">
      <label className="tour-controls__checkbox">
        <input
          checked={trimBorder}
          onChange={(event) => onTrimBorderChange(event.target.checked)}
          type="checkbox"
        />
        Crop borders
      </label>

      <hr className="tour-controls__divider" />

      <label className="tour-controls__checkbox">
        <input
          checked={useCustomBackground}
          onChange={(event) =>
            onUseCustomBackgroundChange(event.target.checked)
          }
          type="checkbox"
        />
        Custom background
      </label>

      {useCustomBackground && (
        <label className="tour-controls__color-control">
          <span className="tour-controls__visually-hidden">
            Video background color
          </span>
          <input
            className="tour-controls__color-input"
            onChange={(event) =>
              onBackgroundColorChange(event.target.value)
            }
            type="color"
            value={backgroundColor}
          />
          <span className="tour-controls__color-value">
            {backgroundColor.toUpperCase()}
          </span>
        </label>
      )}
    </div>
  )
}

function SequenceSettings({
  error,
  isTourActive,
  onInputChange,
  rawInput,
}) {
  return (
    <div className="tour-controls__sequence-settings">
      <textarea
        aria-invalid={Boolean(error)}
        className={`tour-controls__sequence-input${
          error ? ' has-error' : ''
        }`}
        disabled={isTourActive}
        onChange={(event) => onInputChange(event.target.value)}
        rows={2}
        value={rawInput}
      />
      {error && (
        <div className="tour-controls__input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default function TourControls({
  hasInputError,
  inputError,
  isAnimating,
  isTourActive,
  onInputChange,
  onRecordTourChange,
  onTourToggle,
  onVideoBackgroundColorChange,
  onVideoTrimBorderChange,
  onVideoUseCustomBackgroundChange,
  rawInput,
  recordTour,
  videoBackgroundColor,
  videoTrimBorder,
  videoUseCustomBackground,
}) {
  const [isSequenceSettingsOpen, setIsSequenceSettingsOpen] = useState(false)
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false)

  return (
    <div className="tour-controls">
      <button
        className={`tour-controls__tour-button${
          isTourActive ? ' is-active' : ''
        }`}
        disabled={hasInputError}
        onClick={onTourToggle}
        type="button"
      >
        {isTourActive ? '✕ Cancel Tour' : '▶ Play Full Tour'}
      </button>

      <label
        className={`tour-controls__record-toggle${
          recordTour ? ' is-active' : ''
        }`}
      >
        <input
          checked={recordTour}
          disabled={isTourActive}
          onChange={(event) => onRecordTourChange(event.target.checked)}
          type="checkbox"
        />
        🔴 Record Tour as Video
      </label>

      {recordTour && (
        <button
          aria-expanded={isVideoSettingsOpen}
          className="tour-controls__settings-toggle"
          onClick={() => setIsVideoSettingsOpen((isOpen) => !isOpen)}
          type="button"
        >
          {isVideoSettingsOpen
            ? '⚙ Hide Video Settings'
            : '⚙ Video Settings...'}
        </button>
      )}

      {recordTour && isVideoSettingsOpen && (
        <VideoSettings
          backgroundColor={videoBackgroundColor}
          onBackgroundColorChange={onVideoBackgroundColorChange}
          onTrimBorderChange={onVideoTrimBorderChange}
          onUseCustomBackgroundChange={onVideoUseCustomBackgroundChange}
          trimBorder={videoTrimBorder}
          useCustomBackground={videoUseCustomBackground}
        />
      )}

      <button
        aria-expanded={isSequenceSettingsOpen}
        className="tour-controls__settings-toggle"
        disabled={isAnimating}
        onClick={() => setIsSequenceSettingsOpen((isOpen) => !isOpen)}
        type="button"
      >
        {isSequenceSettingsOpen ? '⚙ Hide Settings' : '⚙ Edit Sequence...'}
      </button>

      {isSequenceSettingsOpen && (
        <SequenceSettings
          error={inputError}
          isTourActive={isTourActive}
          onInputChange={onInputChange}
          rawInput={rawInput}
        />
      )}
    </div>
  )
}

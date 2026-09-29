import './AppHeader.css'

function getStatusClass(isAnimating, isTourActive) {
  if (isTourActive) return ' is-tour-active'
  if (isAnimating) return ' is-target-active'
  return ' is-current-active'
}

export default function AppHeader({
  currentType,
  genus,
  isAnimating,
  isMobile,
  isSidebarOpen,
  isTourActive,
  onGenusSwitch,
  onSettingsToggle,
  onSidebarToggle,
  showSettingsPanel,
}) {
  const showStatus = !isMobile || !isSidebarOpen
  const statusClass = getStatusClass(isAnimating, isTourActive)

  return (
    <header className="app-header">
      {showStatus && (
        <div
          className={`app-header__status${
            isMobile ? ' is-mobile' : ''
          }${statusClass}`}
        >
          TYPE: {currentType}
        </div>
      )}

      {isMobile && (
        <button
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          className={`app-header__mobile-menu${
            showSettingsPanel ? ' is-settings-open' : ''
          }`}
          onClick={onSidebarToggle}
          type="button"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}

      <button
        aria-label={`Switch to genus ${genus === 2 ? 3 : 2}`}
        className={`app-header__genus-button${
          genus === 3 ? ' is-genus-three' : ''
        }${showSettingsPanel ? ' is-settings-open' : ''}`}
        onClick={onGenusSwitch}
        type="button"
      >
        <span className="app-header__genus-label-full">GENUS {genus}</span>
        <span className="app-header__genus-label-short">G{genus}</span>
      </button>

      <button
        aria-expanded={showSettingsPanel}
        aria-label={
          showSettingsPanel ? 'Close design settings' : 'Open design settings'
        }
        className={`app-header__settings-button${
          showSettingsPanel ? ' is-open' : ''
        }`}
        onClick={onSettingsToggle}
        type="button"
      >
        {showSettingsPanel ? '✕' : '⚙️'}
      </button>
    </header>
  )
}

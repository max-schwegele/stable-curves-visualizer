import './NavigationSidebar.css'

function getStatus(isAnimating, isTourActive) {
  if (isTourActive) {
    return { className: 'is-tour-active', label: 'TOUR STATUS' }
  }
  if (isAnimating) {
    return { className: 'is-target-active', label: 'TARGET TYPE' }
  }
  return { className: 'is-current-active', label: 'REDUCTION TYPE' }
}

export default function NavigationSidebar({
  currentType,
  exportControls,
  isAnimating,
  isMobile,
  isOpen,
  isTourActive,
  mobileControls,
  navigationControls,
  tourControls,
}) {
  const status = getStatus(isAnimating, isTourActive)

  return (
    <aside
      aria-label="Curve type navigation"
      className={`navigation-sidebar${isMobile ? ' is-mobile' : ''}${
        isOpen ? ' is-open' : ''
      }`}
    >
      <div className="navigation-sidebar__status">
        <div className="navigation-sidebar__status-label">{status.label}</div>
        <div
          className={`navigation-sidebar__status-value ${status.className}`}
        >
          {currentType}
        </div>
      </div>

      <div className="navigation-sidebar__panel">
        {tourControls}
        <hr className="navigation-sidebar__divider" />
        {navigationControls}
        {exportControls}
      </div>

      {mobileControls}
    </aside>
  )
}

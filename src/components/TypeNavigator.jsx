import { GENUS_DATA } from '../config.js'

import './TypeNavigator.css'

function activeTypeClass(isAnimating, isTourActive) {
  if (isTourActive) return ' is-tour-active'
  if (isAnimating) return ' is-target-active'
  return ' is-current-active'
}

function TypeButton({
  type,
  currentType,
  isAnimating,
  isTourActive,
  variant,
  onSelect,
}) {
  const isActive = currentType === type
  const stateClass = isActive
    ? activeTypeClass(isAnimating, isTourActive)
    : ''

  return (
    <button
      aria-pressed={isActive}
      className={`type-navigator__type-button type-navigator__type-button--${variant}${stateClass}`}
      onClick={() => onSelect(type)}
      type="button"
    >
      {type}
    </button>
  )
}

export default function TypeNavigator({
  genus,
  currentType,
  activeG3Page,
  isAnimating,
  isTourActive,
  onG3PageChange,
  onTypeSelect,
}) {
  const sharedTypeButtonProps = {
    currentType,
    isAnimating,
    isTourActive,
    onSelect: onTypeSelect,
  }

  return (
    <div className="type-navigator">
      <div className="type-navigator__heading">GO TO TYPE:</div>

      {genus === 2 ? (
        <div className="type-navigator__genus-two-list">
          {GENUS_DATA[2].TYPES.map((type) => (
            <TypeButton
              key={type}
              {...sharedTypeButtonProps}
              type={type}
              variant="genus-two"
            />
          ))}
        </div>
      ) : (
        <GenusThreeNavigator
          activePage={activeG3Page}
          onPageChange={onG3PageChange}
          sharedTypeButtonProps={sharedTypeButtonProps}
        />
      )}
    </div>
  )
}

function GenusThreeNavigator({
  activePage,
  onPageChange,
  sharedTypeButtonProps,
}) {
  const sections = GENUS_DATA[3].SECTIONS
  const activeSection = sections[activePage] ?? sections[0]

  return (
    <div className="type-navigator__genus-three">
      <div className="type-navigator__page-tabs">
        {sections.map((section, index) => (
          <button
            aria-pressed={activePage === index}
            className={`type-navigator__page-tab${
              activePage === index ? ' is-active' : ''
            }`}
            key={section.id}
            onClick={() => onPageChange(index)}
            type="button"
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="type-navigator__section">
        {activeSection.subgroups.map((group, groupIndex) => (
          <div
            className="type-navigator__subgroup"
            key={group.label}
          >
            {groupIndex > 0 && (
              <hr className="type-navigator__subgroup-divider" />
            )}
            <div className="type-navigator__subgroup-label">
              {group.label}
            </div>
            <div className="type-navigator__genus-three-list">
              {group.items.map((type) => (
                <TypeButton
                  key={type}
                  {...sharedTypeButtonProps}
                  type={type}
                  variant="genus-three"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

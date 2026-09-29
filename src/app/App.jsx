import { Leva, useControls } from 'leva'
import { useCallback, useRef, useState } from 'react'

import { GENUS_DATA } from '../config.js'
import { createExportQualityControlSchema } from '../features/export/exportQualityControls.js'
import { useSnapshotExport } from '../features/export/useSnapshotExport.js'
import { useTourSequence } from '../features/tour/useTourSequence.js'
import { useTourRecorder } from '../features/export/useTourRecorder.js'
import {
  DesktopDiagramPanel,
  MobileDiagramControls,
  MobileDiagramOverlay,
} from '../components/DiagramPanel.jsx'
import AppHeader from '../components/AppHeader.jsx'
import ExportPanel from '../components/ExportPanel.jsx'
import NavigationSidebar from '../components/NavigationSidebar.jsx'
import SceneCanvas from '../components/SceneCanvas.jsx'
import TourControls from '../components/TourControls.jsx'
import TypeNavigator from '../components/TypeNavigator.jsx'
import { useResponsiveLayout } from './useResponsiveLayout.js'

import './App.css'

function getGenus3PageIndex(type) {
  return GENUS_DATA[3].SECTIONS.findIndex((section) =>
    section.subgroups.some((subgroup) => subgroup.items.includes(type)),
  )
}

export default function App() {
  const [genus, setGenus] = useState(2)
  const [activeG3Page, setActiveG3Page] = useState(0)

  // Topology and animation state
  const [currentType, setCurrentType] = useState(GENUS_DATA[2].DEFAULT_TYPE)
  const [clickTarget, setClickTarget] = useState(null)
  const [tourTrigger, setTourTrigger] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)

  const {
    hasInputError,
    inputError,
    rawInput,
    resetTourSequence,
    tourSequence,
    updateTourInput,
  } = useTourSequence(2)

  // Diagram visibility
  const [isCurveVisible, setIsCurveVisible] = useState(false)
  const [isGraphVisible, setIsGraphVisible] = useState(false)

  // Snapshot settings
  const [useCustomBackground, setUseCustomBackground] = useState(false)
  const [snapshotBackgroundColor, setSnapshotBackgroundColor] = useState('#ffffff')
  const [includeCurve, setIncludeCurve] = useState(false)
  const [includeGraph, setIncludeGraph] = useState(false)
  const [trimSnapshotBorder, setTrimSnapshotBorder] = useState(true)
  const [includeTypeLabel, setIncludeTypeLabel] = useState(false)

  // Video settings
  const [shouldRecordTour, setShouldRecordTour] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [videoTrimBorder, setVideoTrimBorder] = useState(true)
  const [videoUseCustomBackground, setVideoUseCustomBackground] = useState(false)
  const [videoBackgroundColor, setVideoBackgroundColor] = useState('#ffffff')

  const {
    closeSidebar,
    isMobile,
    isSidebarOpen,
    toggleSidebar,
  } = useResponsiveLayout()
  const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false)
  const animationRequestIdRef = useRef(0)

  const [{ videoBitrate, renderDPR }] = useControls(
    createExportQualityControlSchema,
  )

  const handleSnapshotExport = useSnapshotExport({
    backgroundColor: snapshotBackgroundColor,
    devicePixelRatio: renderDPR,
    genus,
    includeCurve,
    includeGraph,
    includeTypeLabel,
    isKnownType: GENUS_DATA[genus].TYPES.includes(currentType),
    trimBorder: trimSnapshotBorder,
    type: currentType,
    useCustomBackground,
  })

  useTourRecorder({
    backgroundColor: videoBackgroundColor,
    bitrateMbps: videoBitrate,
    devicePixelRatio: renderDPR,
    genus,
    isRecording,
    trimBorder: videoTrimBorder,
    useCustomBackground: videoUseCustomBackground,
  })

  const handleTypeChange = useCallback(
    (type) => {
      setCurrentType(type)

      if (genus !== 3) return

      const targetPageIndex = getGenus3PageIndex(type)
      if (targetPageIndex !== -1) {
        setActiveG3Page(targetPageIndex)
      }
    },
    [genus],
  )

  const handleGenusSwitch = () => {
    const newGenus = genus === 2 ? 3 : 2
    setIsAnimating(false)
    setIsTourActive(false)
    setIsRecording(false)
    setTourTrigger(null)
    setClickTarget(null)

    setGenus(newGenus)
    setActiveG3Page(0)
    setCurrentType(GENUS_DATA[newGenus].DEFAULT_TYPE)

    resetTourSequence(newGenus)
  }

  const handleInputChange = useCallback(
    (text) => updateTourInput(text, genus),
    [genus, updateTourInput],
  )

  const handleTypeSelect = (type) => {
    setIsAnimating(true)
    setIsTourActive(false)
    setIsRecording(false)

    handleTypeChange(type)
    animationRequestIdRef.current += 1
    setClickTarget({ type, requestId: animationRequestIdRef.current })
    if (isMobile) closeSidebar()
  }

  const handleTourToggle = () => {
    if (isTourActive) {
      setIsAnimating(false)
      setIsTourActive(false)
      setIsRecording(false)
      setTourTrigger(null)
    } else {
      setIsAnimating(true)
      setIsTourActive(true)
      animationRequestIdRef.current += 1
      setTourTrigger({ requestId: animationRequestIdRef.current })
      if (isMobile) closeSidebar()
    }
  }

  return (
    <div className="app">
      <Leva
        hidden={!isDesignPanelOpen}
        hideCopyButton
        titleBar={false}
      />

      <AppHeader
        currentType={currentType}
        genus={genus}
        isAnimating={isAnimating}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        isTourActive={isTourActive}
        onGenusSwitch={handleGenusSwitch}
        onSettingsToggle={() => setIsDesignPanelOpen((isOpen) => !isOpen)}
        onSidebarToggle={toggleSidebar}
        showSettingsPanel={isDesignPanelOpen}
      />

      <NavigationSidebar
        currentType={currentType}
        exportControls={
          <ExportPanel
            backgroundColor={snapshotBackgroundColor}
            includeCurve={includeCurve}
            includeGraph={includeGraph}
            includeTypeLabel={includeTypeLabel}
            onBackgroundColorChange={setSnapshotBackgroundColor}
            onExport={handleSnapshotExport}
            onIncludeCurveChange={setIncludeCurve}
            onIncludeGraphChange={setIncludeGraph}
            onIncludeTypeLabelChange={setIncludeTypeLabel}
            onTrimBorderChange={setTrimSnapshotBorder}
            onUseCustomBackgroundChange={setUseCustomBackground}
            trimBorder={trimSnapshotBorder}
            useCustomBackground={useCustomBackground}
          />
        }
        isAnimating={isAnimating}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        isTourActive={isTourActive}
        mobileControls={
          isMobile ? (
            <MobileDiagramControls
              onToggleCurve={() => setIsCurveVisible((visible) => !visible)}
              onToggleGraph={() => setIsGraphVisible((visible) => !visible)}
              showCurve={isCurveVisible}
              showGraph={isGraphVisible}
            />
          ) : null
        }
        navigationControls={
          <TypeNavigator
            activeG3Page={activeG3Page}
            currentType={currentType}
            genus={genus}
            isAnimating={isAnimating}
            isTourActive={isTourActive}
            onG3PageChange={setActiveG3Page}
            onTypeSelect={handleTypeSelect}
          />
        }
        tourControls={
          <TourControls
            hasInputError={hasInputError}
            inputError={inputError}
            isAnimating={isAnimating}
            isTourActive={isTourActive}
            onInputChange={handleInputChange}
            onRecordTourChange={setShouldRecordTour}
            onTourToggle={handleTourToggle}
            onVideoBackgroundColorChange={setVideoBackgroundColor}
            onVideoTrimBorderChange={setVideoTrimBorder}
            onVideoUseCustomBackgroundChange={setVideoUseCustomBackground}
            rawInput={rawInput}
            recordTour={shouldRecordTour}
            videoBackgroundColor={videoBackgroundColor}
            videoTrimBorder={videoTrimBorder}
            videoUseCustomBackground={videoUseCustomBackground}
          />
        }
      />

      {isMobile && (
        <MobileDiagramOverlay
          genus={genus}
          isKnownType={GENUS_DATA[genus].TYPES.includes(currentType)}
          showCurve={isCurveVisible}
          showGraph={isGraphVisible}
          type={currentType}
        />
      )}

      {!isMobile && (
        <div className="app__desktop-diagrams">
          <DesktopDiagramPanel
            genus={genus}
            isKnownType={GENUS_DATA[genus].TYPES.includes(currentType)}
            onToggleCurve={() => setIsCurveVisible((visible) => !visible)}
            onToggleGraph={() => setIsGraphVisible((visible) => !visible)}
            showCurve={isCurveVisible}
            showGraph={isGraphVisible}
            type={currentType}
          />
        </div>
      )}

      <SceneCanvas
        clickTarget={clickTarget}
        devicePixelRatio={renderDPR}
        genus={genus}
        isAnimating={isAnimating}
        isTourActive={isTourActive}
        onAnimatingChange={setIsAnimating}
        onStartRecording={() => {
          if (shouldRecordTour) setIsRecording(true)
        }}
        onStopRecording={() => setIsRecording(false)}
        onTourActiveChange={setIsTourActive}
        onTypeChange={handleTypeChange}
        tourSequence={tourSequence}
        tourTrigger={tourTrigger}
      />
    </div>
  )
}

import { useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { GENUS_DATA } from '../config.js'
import CameraController from '../features/camera/CameraController.jsx'
import ModelG2 from '../features/genus2/ModelG2.jsx'
import ModelG3 from '../features/genus3/ModelG3.jsx'

import './SceneCanvas.css'

useGLTF.preload(GENUS_DATA[2].MODEL_URL)
useGLTF.preload(GENUS_DATA[3].MODEL_URL)

export default function SceneCanvas({
  clickTarget,
  devicePixelRatio,
  genus,
  isAnimating,
  isTourActive,
  onAnimatingChange,
  onStartRecording,
  onStopRecording,
  onTourActiveChange,
  onTypeChange,
  tourSequence,
  tourTrigger,
}) {
  const SurfaceModel = genus === 2 ? ModelG2 : ModelG3

  return (
    <div className="scene-canvas" id="canvas__container">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        dpr={devicePixelRatio}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight intensity={2} position={[10, 10, 5]} />
        <SurfaceModel
          clickTarget={clickTarget}
          isAnimating={isAnimating}
          isTourActive={isTourActive}
          onAnimatingChange={onAnimatingChange}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onTourActiveChange={onTourActiveChange}
          onTypeChange={onTypeChange}
          tourSequence={tourSequence}
          tourTrigger={tourTrigger}
        />
        <CameraController genus={genus} />
      </Canvas>
    </div>
  )
}

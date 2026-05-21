import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, BrightnessContrast } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Simulation } from './components/Simulation';
import { UI } from './components/UI';
import './App.css';

function App() {
  const [controls, setControls] = useState({
    steering: { x: 0, y: 0 }, 
    insertion: 10, 
    insufflation: 1.0, 
    nbi: false,
    scenario: 'normal'
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.08; 
      const moveStep = 1.0;
      
      switch (e.key.toLowerCase()) {
        case 'w': setControls(prev => ({ ...prev, steering: { ...prev.steering, y: Math.min(prev.steering.y + step, 1) } })); break;
        case 's': setControls(prev => ({ ...prev, steering: { ...prev.steering, y: Math.max(prev.steering.y - step, -1) } })); break;
        case 'a': setControls(prev => ({ ...prev, steering: { ...prev.steering, x: Math.max(prev.steering.x - step, -1) } })); break;
        case 'd': setControls(prev => ({ ...prev, steering: { ...prev.steering, x: Math.min(prev.steering.x + step, 1) } })); break;
        case 'arrowup': setControls(prev => ({ ...prev, insertion: Math.min(prev.insertion + moveStep, 80) })); break;
        case 'arrowdown': setControls(prev => ({ ...prev, insertion: Math.max(prev.insertion - moveStep, 0) })); break;
        case 'i': setControls(prev => ({ ...prev, insufflation: Math.min(prev.insufflation + 0.05, 2.5) })); break;
        case 'o': setControls(prev => ({ ...prev, insufflation: Math.max(prev.insufflation - 0.05, 0.5) })); break;
        case 'r': setControls(prev => ({ ...prev, steering: { x: 0, y: 0 } })); break;
        case 'n': setControls(prev => ({ ...prev, nbi: !prev.nbi })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="simulation-container">
      <Canvas
        key="endo-canvas-v1"
        shadows
        camera={{ position: [0, 0, 0], fov: 90 }}
        gl={{ 
          antialias: true,
          toneMapping: 3, 
          toneMappingExposure: 1.2,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#050000']} />
        
        <Suspense fallback={null}>
          <Simulation controls={controls} />
          
          <EffectComposer>
            <Bloom 
              intensity={0.5} 
              luminanceThreshold={0.5} 
              luminanceSmoothing={0.3} 
            />
            <BrightnessContrast brightness={-0.1} contrast={0.2} />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.001, 0.001]}
            />
            <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
            {/* Using CSS Vignette instead for sharper clinical look */}
          </EffectComposer>
        </Suspense>
      </Canvas>
      <UI controls={controls} setControls={setControls} />
    </div>
  );
}

export default App;

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createStomachGeometry } from '../utils/geometry';
import './MucosaMaterial';

export function Anatomy({ 
  insufflation, 
  cameraPos, 
  lightPos, 
  nbi, 
  scenario 
}: { 
  insufflation: number, 
  cameraPos: THREE.Vector3, 
  lightPos: THREE.Vector3,
  nbi: boolean,
  scenario: string
}) {
  // Use a higher detail geometry for the stomach
  const stomachGeom = useMemo(() => createStomachGeometry(8.5, 300), []);
  const stomachRef = useRef<any>();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (stomachRef.current) {
      stomachRef.current.uTime = time;
      stomachRef.current.uCameraPos.copy(cameraPos);
      stomachRef.current.uLightPos.copy(lightPos);
      stomachRef.current.uInsufflation = insufflation;
      stomachRef.current.uIsNBI = nbi ? 1.0 : 0.0;
      
      if (scenario === 'ulcer') {
        stomachRef.current.uLesionPos.set(-2.5, 3.2, -42.0);
        stomachRef.current.uLesionRadius = 2.4;
      } else {
        stomachRef.current.uLesionRadius = 0.0;
      }
    }
  });

  // Calculate if we are in the stomach based on Z position
  // Transition between esophagus and stomach textures
  const isStomachValue = THREE.MathUtils.smoothstep(Math.abs(cameraPos.z), 15, 30);

  return (
    <group>
      {/* The main GI tract mesh */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <primitive object={stomachGeom} />
        <mucosaShaderMaterial 
          ref={stomachRef}
          side={THREE.BackSide}
          uBaseColor={new THREE.Color('#ff9b9b')} // Slightly lighter for clinical look
          uVesselColor={new THREE.Color('#a50000')} // Deep red for vessels
          uIsStomach={isStomachValue}
          transparent={false}
          depthWrite={true}
        />
      </mesh>

      {/* Endoscope Shaft - High-fidelity clinical black material */}
      <mesh position={[0, 0, -50]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 150, 32]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.1} 
          metalness={0.8} 
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Ambient Fill Light for cavity depth visibility */}
      <ambientLight intensity={0.1} />
    </group>
  );
}

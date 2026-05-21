import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createStomachGeometry } from '../utils/geometry';
import { MucosaShaderMaterial } from './MucosaMaterial';

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
  const stomachGeom = useMemo(() => createStomachGeometry(8.5, 300), []);
  const stomachRef = useRef<THREE.ShaderMaterial | null>(null);
  const materialRef = useRef<InstanceType<typeof MucosaShaderMaterial> | null>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mat = materialRef.current as any;
    if (mat) {
      mat.uTime = time;
      mat.uCameraPos.copy(cameraPos);
      mat.uLightPos.copy(lightPos);
      mat.uInsufflation = insufflation;
      mat.uIsNBI = nbi ? 1.0 : 0.0;
      if (scenario === 'ulcer') {
        mat.uLesionPos.set(-2.5, 3.2, -42.0);
        mat.uLesionRadius = 2.4;
      } else {
        mat.uLesionRadius = 0.0;
      }
    }
  });

  // Calculate if we are in the stomach based on Z position
  // Transition between esophagus and stomach textures
  const isStomachValue = THREE.MathUtils.smoothstep(Math.abs(cameraPos.z), 15, 30);

  const material = useMemo(() => {
    const mat = new MucosaShaderMaterial();
    (mat as any).side = THREE.BackSide;
    (mat as any).uBaseColor = new THREE.Color('#ff9b9b');
    (mat as any).uVesselColor = new THREE.Color('#a50000');
    (mat as any).uIsStomach = isStomachValue;
    return mat;
  }, []);

  // Keep ref in sync
  materialRef.current = material as any;

  return (
    <group>
      {/* The main GI tract mesh */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow material={material}>
        <primitive object={stomachGeom} />
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

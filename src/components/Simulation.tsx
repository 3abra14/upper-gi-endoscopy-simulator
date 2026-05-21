import { useThree, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useRef } from 'react';
import * as THREE from 'three';
import { Anatomy } from './Anatomy';
import { Endoscope } from './Endoscope';

export function Simulation({ controls }: { controls: any }) {
  const { camera } = useThree();
  const lightPos = useRef(new THREE.Vector3());

  useFrame(() => {
    lightPos.current.copy(camera.position);
  });

  return (
    <>
      <Anatomy 
        insufflation={controls.insufflation} 
        cameraPos={camera.position} 
        lightPos={lightPos.current} 
        nbi={controls.nbi}
        scenario={controls.scenario}
      />
      <Endoscope controls={controls} />
    </>
  );
}

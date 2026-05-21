import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),      // Esophagus
  new THREE.Vector3(0, 0, -20),    // Cardia
  new THREE.Vector3(-10, -5, -35), // Fundus
  new THREE.Vector3(-5, -15, -50), // Body
  new THREE.Vector3(5, -10, -65),  // Antrum
  new THREE.Vector3(10, 0, -80),   // Pylorus
  new THREE.Vector3(12, 5, -100),  // Duodenal Bulb
  new THREE.Vector3(10, -5, -120), // Second part of Duodenum
]);

export function Endoscope({ controls }: { controls: any }) {
  const { camera } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = THREE.MathUtils.clamp(controls.insertion / 120, 0, 1);
    const pathPoint = curve.getPointAt(t);
    const pathTangent = curve.getTangentAt(t);
    
    camera.position.lerp(pathPoint, 0.1);
    
    // Stable orientation calculation
    const forward = pathTangent.clone().normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, forward).normalize();
    const up = new THREE.Vector3().crossVectors(forward, right).normalize();

    const lookAtPoint = pathPoint.clone().add(forward.clone().multiplyScalar(2.0));
    const steeringOffset = right.clone().multiplyScalar(controls.steering.x * 5.0)
      .add(up.clone().multiplyScalar(controls.steering.y * 5.0));
    
    lookAtPoint.add(steeringOffset);
    
    const currentQuaternion = camera.quaternion.clone();
    camera.lookAt(lookAtPoint);
    const targetQuaternion = camera.quaternion.clone();
    camera.quaternion.slerpQuaternions(currentQuaternion, targetQuaternion, 0.15);

    if (lightRef.current) {
      const forward = new THREE.Vector3(0, 0, -0.5).applyQuaternion(camera.quaternion);
      lightRef.current.position.copy(camera.position).add(forward);
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      intensity={8} 
      distance={30} 
      decay={2} 
      color="#fffceb"
    />
  );
}

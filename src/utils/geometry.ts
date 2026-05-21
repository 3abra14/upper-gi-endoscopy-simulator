import * as THREE from 'three';

export function createStomachGeometry(radius = 6, detail = 256) {
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

  const geometry = new THREE.TubeGeometry(curve, 100, radius, 64, false);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const vector = new THREE.Vector3();
  const dir = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    vector.fromBufferAttribute(position, i);
    dir.fromBufferAttribute(normal, i);
    
    const t = Math.abs(vector.z) / 120; // Adjusted for new total length

    let radiusScale = 1.0;
    if (t < 0.15) radiusScale = mix(0.4, 1.0, t / 0.15); 
    if (t > 0.66) radiusScale = mix(1.2, 0.4, (t - 0.66) / 0.34); 
    if (t >= 0.15 && t <= 0.66) {
      radiusScale = 1.2 + Math.sin((t - 0.15) * Math.PI / 0.51) * 1.5;
    }
    
    // Ensure the very end is tightly closed (the 'barrier')
    if (t > 0.95) radiusScale = mix(radiusScale, 0.05, (t - 0.95) / 0.05);

    const angle = Math.atan2(vector.y, vector.x);
    const folds = Math.sin(angle * 10.0) * (0.5 + 0.5 * Math.sin(t * 20.0));
    const microFolds = Math.sin(vector.x * 3.0) * Math.cos(vector.z * 3.0);
    
    const displacement = (folds * 1.2) + (microFolds * 0.3);
    vector.add(dir.multiplyScalar(displacement * radiusScale));
    position.setXYZ(i, vector.x, vector.y, vector.z);
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

function mix(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

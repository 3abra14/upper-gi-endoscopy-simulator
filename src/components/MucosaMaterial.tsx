import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

const MucosaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color('#ff7b7b'),
    uVesselColor: new THREE.Color('#8b0000'),
    uCameraPos: new THREE.Vector3(),
    uLightPos: new THREE.Vector3(),
    uInsufflation: 1.0,
    uIsStomach: 1.0,
    uIsNBI: 0.0,
    uLesionPos: new THREE.Vector3(100, 100, 100), // Default far away
    uLesionRadius: 0.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform float uTime;
    uniform float uInsufflation;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      // Clinical "Breathing/Peristalsis" animation
      vec3 pos = position;
      float breath = sin(uTime * 0.8 + position.z * 0.15) * 0.12 * uInsufflation;
      pos += normal * breath;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      vViewDir = normalize(vPosition - cameraPosition);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform vec3 uBaseColor;
    uniform vec3 uVesselColor;
    uniform vec3 uCameraPos;
    uniform vec3 uLightPos;
    uniform float uTime;
    uniform float uIsStomach;
    uniform float uIsNBI;
    uniform vec3 uLesionPos;
    uniform float uLesionRadius;

    // High-fidelity noise for organic textures
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      // 1. Normal Reconstruction (Inside View)
      vec3 normal = normalize(vNormal) * -1.0;
      
      vec3 lightDir = normalize(uLightPos - vPosition);
      vec3 viewDir = normalize(uCameraPos - vPosition);
      float dist = distance(uLightPos, vPosition);
      
      // 2. Clinical Texture (Mucosa + Rugae)
      // Stomach has more prominent rugae (folds), Esophagus is smoother
      float textureScale = mix(15.0, 35.0, uIsStomach);
      float organicNoise = noise(vUv * textureScale + uTime * 0.05);
      vec3 perturbedNormal = normalize(normal + vec3(organicNoise * 0.25));
      
      // 3. Clinical Lighting (High Gain, Low Contrast Falloff)
      float dotNL = dot(perturbedNormal, lightDir);
      
      // Soft-wrap for cavity lighting
      float wrap = 0.6;
      float diff = max(0.0, (dotNL + wrap) / (1.0 + wrap));
      
      // Subsurface Scattering (SSS) for fleshy translucency
      float sss = pow(max(0.0, 1.0 - dotNL), 3.0) * 0.6;
      
      // 4. Color Layers
      // Base tissue transitions from pale pink to deeper red in stomach
      vec3 tissueBase = mix(uBaseColor * 0.7, uBaseColor * 1.2, uIsStomach);
      
      // NBI Palette Shift (Blue/Green narrow band)
      vec3 nbiColor = vec3(0.1, 0.6, 0.5); // Clinical NBI tone
      vec3 tissueColor = mix(tissueBase, nbiColor * 0.5, uIsNBI);
      
      vec3 finalTissue = mix(tissueColor * 0.4, tissueColor, diff);
      finalTissue += vec3(1.0, 0.2, 0.1) * sss * (1.0 + uIsStomach * 0.5) * (1.0 - uIsNBI * 0.8);
      
      // Fine Vascularity (Micro-capillaries)
      float vNoise = noise(vUv * 120.0);
      float veins = smoothstep(0.42, 0.45, noise(vUv * 200.0 + vNoise * 15.0));
      
      // NBI makes vessels look black/dark brown
      vec3 vesselCol = mix(uVesselColor * 1.5, vec3(0.05, 0.1, 0.05), uIsNBI);
      finalTissue = mix(finalTissue, vesselCol, veins * mix(0.4, 0.9, uIsNBI));
      
      // 5. Procedural Lesion (Gastric Ulcer)
      float distToLesion = distance(vPosition, uLesionPos);
      if (uLesionRadius > 0.0 && distToLesion < uLesionRadius) {
        float edge = smoothstep(uLesionRadius * 0.7, uLesionRadius, distToLesion);
        vec3 ulcerBase = vec3(0.9, 0.8, 0.6); // Slough base
        vec3 ulcerEdge = vec3(0.5, 0.1, 0.1); // Hyperemic border
        vec3 ulcerColor = mix(ulcerBase, ulcerEdge, edge);
        finalTissue = mix(ulcerColor, finalTissue, edge);
        
        // Add "crater" shadow
        float depth = (1.0 - edge) * 0.4;
        finalTissue *= (1.0 - depth);
      }

      // 6. Specular Highlights (Wet Clinical Look)
      vec3 halfDir = normalize(lightDir + viewDir);
      float shininess = mix(128.0, 256.0, uIsStomach); // Stomach is wetter
      float spec = pow(max(0.0, dot(perturbedNormal, halfDir)), shininess);
      
      // Micro-specular for moisture particles
      float microSpec = pow(max(0.0, dot(normalize(perturbedNormal + noise(vUv * 500.0) * 0.15), halfDir)), 80.0);
      
      vec3 specular = vec3(1.0, 1.0, 0.95) * (spec * 1.8 + microSpec * 0.7);
      
      // 7. Final Composition
      vec3 finalColor = finalTissue + specular;
      
      // Exposure & Distance Falloff (Flashlight Effect)
      float attenuation = 1.0 / (1.0 + 0.005 * dist + 0.0002 * dist * dist);
      finalColor *= attenuation;
      
      // Gain boost for clinical visibility (Reduced for realism)
      finalColor *= 1.2;
      
      // Desaturate slightly for "Xenon" light feel (unless NBI is active)
      float grey = dot(finalColor, vec3(0.299, 0.587, 0.114));
      finalColor = mix(finalColor, vec3(grey), mix(0.1, 0.0, uIsNBI));

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

export { MucosaShaderMaterial };
extend({ MucosaShaderMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mucosaShaderMaterial: any;
    }
  }
}

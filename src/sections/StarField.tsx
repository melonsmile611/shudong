import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StarFieldProps {
  isWriting: boolean;
}

export default function StarField({ isWriting }: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const stateRef = useRef({ isWriting, time: 0 });

  useEffect(() => {
    stateRef.current.isWriting = isWriting;
  }, [isWriting]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050B14, 0.0015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050B14, 1);
    container.appendChild(renderer.domElement);

    // Star particles
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starOpacities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = r * Math.cos(phi);
      starSizes[i] = 1 + Math.random() * 2.5;
      starOpacities[i] = 0.3 + Math.random() * 0.7;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x8B7EC8) },
        uColor2: { value: new THREE.Color(0x4A90D9) },
        uColor3: { value: new THREE.Color(0xD4A843) },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        uniform float uTime;
        void main() {
          vOpacity = opacity;
          vec3 pos = position;
          float twinkle = sin(uTime * 0.8 + pos.x * 0.01 + pos.y * 0.01) * 0.3 + 0.7;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * twinkle * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist) * vOpacity;
          vec3 color = mix(uColor1, uColor2, gl_PointCoord.x);
          color = mix(color, uColor3, gl_PointCoord.y * 0.3);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Vortex lines
    const lineCount = 80;
    const lineGroup = new THREE.Group();
    const lines: { mesh: THREE.Line; speed: number; offset: number }[] = [];

    for (let i = 0; i < lineCount; i++) {
      const points: THREE.Vector3[] = [];
      const segments = 100;
      const radius = 50 + Math.random() * 200;
      const heightSpread = 100 + Math.random() * 200;
      const twist = 2 + Math.random() * 4;

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const angle = t * Math.PI * 2 * twist + (i * 0.3);
        const r = radius * (0.5 + 0.5 * t);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = (t - 0.5) * heightSpread;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));

      const color = new THREE.Color().setHSL(
        0.65 + Math.random() * 0.15,
        0.5 + Math.random() * 0.3,
        0.4 + Math.random() * 0.3
      );

      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.25,
      });

      const line = new THREE.Line(tubeGeo, lineMat);
      lineGroup.add(line);
      lines.push({ mesh: line, speed: 0.001 + Math.random() * 0.003, offset: Math.random() * Math.PI * 2 });
    }

    scene.add(lineGroup);

    // Mouse handler
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const state = stateRef.current;
      state.time += 0.016;

      // Lerp mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const speedMultiplier = state.isWriting ? 1.8 : 1;
      const t = state.time * speedMultiplier;

      // Rotate vortex
      lineGroup.rotation.z = t * 0.05;
      lineGroup.rotation.x = mouseRef.current.y * 0.1;
      lineGroup.rotation.y = mouseRef.current.x * 0.1;

      // Update line colors breathing
      lines.forEach((line, i) => {
        const hueShift = Math.sin(t * 0.2 + line.offset) * 0.1;
        (line.mesh.material as THREE.LineBasicMaterial).color.offsetHSL(hueShift * 0.01, 0, 0);
        line.mesh.rotation.z = line.speed * t * (i % 2 === 0 ? 1 : -1);
      });

      // Update stars
      starMat.uniforms.uTime.value = t;
      stars.rotation.y = t * 0.005;
      stars.rotation.x = mouseRef.current.y * 0.02;

      // Camera drift
      camera.position.x = mouseRef.current.x * 30;
      camera.position.y = -mouseRef.current.y * 30;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      lines.forEach(l => {
        l.mesh.geometry.dispose();
        (l.mesh.material as THREE.LineBasicMaterial).dispose();
      });
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

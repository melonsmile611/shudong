import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface ReleaseEffectProps {
  text: string;
  onComplete: () => void;
}

export default function ReleaseEffect({ text, onComplete }: ReleaseEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const container = containerRef.current;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050B14, 0.0015);

    // Orthographic camera for pixel-perfect alignment
    const aspect = w / h;
    const frustum = 300;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      1,
      5000
    );
    camera.position.set(0, -120, 100);
    camera.lookAt(0, -40, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050B14, 0);
    container.appendChild(renderer.domElement);

    // ===== TEXT TO 3D PARTICLES =====
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d')!;
    const sampleSize = 8;
    offscreenCanvas.width = 80;
    offscreenCanvas.height = Math.ceil(80 * (h / w));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = `${sampleSize}px "Lora", "Noto Serif SC", serif`;
    ctx.textBaseline = 'top';

    // Wrap text
    const maxTextW = offscreenCanvas.width - 4;
    const lines: string[] = [];
    const chars = text.split('');
    let line = '';
    for (const char of chars) {
      const test = line + char;
      if (ctx.measureText(test).width > maxTextW && line.length > 0) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    lines.push(line);

    lines.forEach((l, i) => {
      ctx.fillText(l, 2, 2 + i * (sampleSize + 2));
    });

    // Extract pixels
    const imgData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const textParticles: THREE.Vector3[] = [];

    for (let y = 0; y < offscreenCanvas.height; y++) {
      for (let x = 0; x < offscreenCanvas.width; x++) {
        const idx = (y * offscreenCanvas.width + x) * 4;
        const brightness = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;
        if (brightness < 128) {
          textParticles.push(
            new THREE.Vector3(
              (x - offscreenCanvas.width / 2) * 3,
              -(y - offscreenCanvas.height / 2) * 3,
              0
            )
          );
        }
      }
    }

    // Create text particle system
    const textParticleGeo = new THREE.BufferGeometry();
    const textPositions = new Float32Array(textParticles.length * 3);
    const textColors = new Float32Array(textParticles.length * 3);

    textParticles.forEach((p, i) => {
      textPositions[i * 3] = p.x;
      textPositions[i * 3 + 1] = p.y;
      textPositions[i * 3 + 2] = p.z;
      textColors[i * 3] = 1.0;
      textColors[i * 3 + 1] = 0.84;
      textColors[i * 3 + 2] = 0.4;
    });

    textParticleGeo.setAttribute('position', new THREE.BufferAttribute(textPositions, 3));
    textParticleGeo.setAttribute('color', new THREE.BufferAttribute(textColors, 3));

    const textParticleMat = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const textPointCloud = new THREE.Points(textParticleGeo, textParticleMat);
    scene.add(textPointCloud);

    // ===== LANTERN INSTANCES =====
    const lanternCount = Math.min(300, Math.max(80, textParticles.length));
    const lanternData: {
      position: THREE.Vector3;
      baseY: number;
      swayPhase: number;
      assignedParticles: number[];
    }[] = [];

    for (let i = 0; i < lanternCount; i++) {
      lanternData.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 600,
          -200 + Math.random() * 400,
          (Math.random() - 0.5) * 400
        ),
        baseY: 0,
        swayPhase: Math.random() * Math.PI * 2,
        assignedParticles: [],
      });
    }

    // Assign particles to nearest lantern
    textParticles.forEach((p, pIdx) => {
      let nearest = 0;
      let nearestDist = Infinity;
      lanternData.forEach((l, lIdx) => {
        const d = p.distanceTo(l.position);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = lIdx;
        }
      });
      lanternData[nearest].assignedParticles.push(pIdx);
    });

    // Create lantern geometry
    const lanternGroup = new THREE.Group();
    scene.add(lanternGroup);

    const lanterns: THREE.Mesh[] = [];

    // Create lantern meshes (simplified geometry for performance)
    lanternData.forEach((ld) => {
      const lanternGeo = new THREE.SphereGeometry(4, 8, 6);
      lanternGeo.scale(1, 1.3, 1);

      const lanternMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1 + Math.random() * 0.05, 0.8, 0.6),
        transparent: true,
        opacity: 0.7,
      });

      const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
      lanternMesh.position.copy(ld.position);
      lanternGroup.add(lanternMesh);
      lanterns.push(lanternMesh);

      // Inner glow
      const glowGeo = new THREE.SphereGeometry(2.5, 6, 4);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.4,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(ld.position);
      lanternGroup.add(glowMesh);
    });

    // Glow lights
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.5);
    scene.add(ambientLight);

    // ===== GSAP ANIMATION TIMELINE =====
    const timeline = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          textParticleGeo.dispose();
          textParticleMat.dispose();
          lanterns.forEach((l) => {
            l.geometry.dispose();
            (l.material as THREE.MeshBasicMaterial).dispose();
          });
          renderer.dispose();
          container.removeChild(renderer.domElement);
          onComplete();
        }, 800);
      },
    });

    // Phase 2: Text particles lerp to lantern positions (0.5s delay, 2.5s duration)
    timeline.to(
      {},
      {
        duration: 2.5,
        delay: 0.5,
        onStart: () => {
          const startPositions = textPositions.slice();
          const targetPositions = new Float32Array(textParticles.length * 3);

          textParticles.forEach((_, pIdx) => {
            // Find assigned lantern
            let lanternIdx = 0;
            lanternData.forEach((l, li) => {
              if (l.assignedParticles.includes(pIdx)) {
                lanternIdx = li;
              }
            });
            const lantern = lanternData[lanternIdx];
            targetPositions[pIdx * 3] = lantern.position.x + (Math.random() - 0.5) * 8;
            targetPositions[pIdx * 3 + 1] = lantern.position.y + (Math.random() - 0.5) * 8;
            targetPositions[pIdx * 3 + 2] = lantern.position.z + (Math.random() - 0.5) * 8;
          });

          gsap.to(
            {},
            {
              duration: 2.5,
              ease: 'power2.out',
              onUpdate: function () {
                const progress = this.progress();
                for (let i = 0; i < textParticles.length; i++) {
                  textPositions[i * 3] =
                    startPositions[i * 3] +
                    (targetPositions[i * 3] - startPositions[i * 3]) * progress;
                  textPositions[i * 3 + 1] =
                    startPositions[i * 3 + 1] +
                    (targetPositions[i * 3 + 1] - startPositions[i * 3 + 1]) * progress;
                  textPositions[i * 3 + 2] =
                    startPositions[i * 3 + 2] +
                    (targetPositions[i * 3 + 2] - startPositions[i * 3 + 2]) * progress;
                }
                textParticleGeo.attributes.position.needsUpdate = true;
              },
            }
          );

          // Lanterns rise slightly during this phase
          lanternData.forEach((ld, i) => {
            gsap.to(lanterns[i].position, {
              y: ld.position.y + 50,
              duration: 2.5,
              ease: 'power2.out',
            });
          });
        },
      }
    );

    // Phase 3: Ascend together (1.0s delay, 10s duration)
    timeline.to(
      {},
      {
        duration: 8,
        delay: 0.5,
        onStart: () => {
          // Move lanterns up
          lanternData.forEach((ld, i) => {
            gsap.to(lanterns[i].position, {
              y: ld.position.y + 1500,
              duration: 10,
              ease: 'power1.in',
            });
          });

          // Move text particles with lanterns
          gsap.to(textPointCloud.position, {
            y: 1500,
            duration: 10,
            ease: 'power1.in',
          });

          // Fade text particles
          gsap.to(textParticleMat, {
            opacity: 0.3,
            duration: 8,
            delay: 2,
          });
        },
      }
    );

    // Phase 4: Camera dive (2.5s delay, 8s duration)
    timeline.to(
      camera.position,
      {
        y: -2000,
        duration: 8,
        ease: 'power2.in',
      },
      '+=0.5'
    );

    timeline.to(
      camera.position,
      {
        x: 500,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      '<'
    );

    // Fade out everything
    timeline.to(textParticleMat, { opacity: 0, duration: 2 }, '-=2');
    timeline.to(lanternGroup.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 2 }, '-=2');

    // ===== RENDER LOOP =====
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lantern sway
      lanternData.forEach((ld, i) => {
        const sway = Math.sin(elapsed * 0.5 + ld.swayPhase) * 15;
        lanterns[i].position.x = ld.position.x + sway;
      });

      // Text particles gentle sway
      const posArray = textParticleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < textParticles.length; i++) {
        posArray[i * 3] += Math.sin(elapsed * 0.3 + i * 0.01) * 0.02;
      }
      textParticleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      timeline.kill();
      textParticleGeo.dispose();
      textParticleMat.dispose();
      lanterns.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.MeshBasicMaterial).dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    />
  );
}

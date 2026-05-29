import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface ShredEffectProps {
  text: string;
  onComplete: () => void;
}

export default function ShredEffect({ text, onComplete }: ShredEffectProps) {
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
    scene.fog = new THREE.FogExp2(0x050B14, 0.002);

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    camera.position.set(0, 0, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050B14, 0);
    container.appendChild(renderer.domElement);

    // Create text texture via canvas
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d')!;
    const canvasW = 650;
    const canvasH = Math.max(300, Math.min(600, text.length * 1.5 + 100));
    textCanvas.width = canvasW;
    textCanvas.height = canvasH;

    // Fill dark background
    textCtx.fillStyle = '#0a0e1a';
    textCtx.fillRect(0, 0, canvasW, canvasH);

    // Draw glass panel border
    textCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    textCtx.lineWidth = 2;
    textCtx.beginPath();
    textCtx.roundRect(2, 2, canvasW - 4, canvasH - 4, 20);
    textCtx.stroke();

    // Draw text
    textCtx.fillStyle = '#e8e8e8';
    textCtx.font = '18px "Lora", "Noto Serif SC", serif';
    textCtx.textBaseline = 'top';

    const lines: string[] = [];
    const maxWidth = canvasW - 60;
    const words = text.split('');
    let currentLine = '';
    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = textCtx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const lineHeight = 32;
    const startY = 30;
    lines.forEach((line, i) => {
      textCtx.fillText(line, 30, startY + i * lineHeight);
    });

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.needsUpdate = true;

    // Create fragment grid
    let cols: number, rows: number;
    if (w <= 1024) {
      cols = 13;
      rows = 18;
    } else if (w <= 1440) {
      cols = 17;
      rows = 24;
    } else {
      cols = 21;
      rows = 30;
    }

    const fragmentW = canvasW / cols;
    const fragmentH = canvasH / rows;
    const totalFragments = cols * rows;

    const fragments: {
      mesh: THREE.Mesh;
      originalX: number;
      originalY: number;
      targetAngle: number;
      targetRadius: number;
    }[] = [];

    const boxGeo = new THREE.BoxGeometry(fragmentW * 0.9, fragmentH * 0.9, 4);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Extract pixel color from this region
        const sx = Math.floor(col * fragmentW);
        const sy = Math.floor(row * fragmentH);
        const sw = Math.floor(fragmentW);
        const sh = Math.floor(fragmentH);

        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        try {
          const imgData = textCtx.getImageData(sx, sy, sw, sh);
          for (let i = 0; i < imgData.data.length; i += 16) {
            r += imgData.data[i];
            g += imgData.data[i + 1];
            b += imgData.data[i + 2];
            count++;
          }
          if (count > 0) {
            r /= count;
            g /= count;
            b /= count;
          }
        } catch {
          // Fallback color
        }

        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(r / 255, g / 255, b / 255),
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(boxGeo, mat);

        const x = (col - cols / 2) * fragmentW + fragmentW / 2;
        const y = -(row - rows / 2) * fragmentH - fragmentH / 2;

        mesh.position.set(x, y, 0);
        mesh.rotation.z = Math.PI / 4; // 45-degree tilt

        scene.add(mesh);

        const idx = row * cols + col;
        const angle = (idx / totalFragments) * Math.PI * 2;
        const radius = 100;

        fragments.push({
          mesh,
          originalX: x,
          originalY: y,
          targetAngle: angle,
          targetRadius: radius,
        });
      }
    }

    // Center of screen
    const cx = 0;
    const cy = 0;

    // Animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Cleanup after a delay
        setTimeout(() => {
          fragments.forEach((f) => {
            f.mesh.geometry.dispose();
            (f.mesh.material as THREE.MeshBasicMaterial).dispose();
            scene.remove(f.mesh);
          });
          renderer.dispose();
          container.removeChild(renderer.domElement);
          onComplete();
        }, 500);
      },
    });

    // Phase 1: Shred - explosion outward
    tl.to(
      {},
      {
        duration: 0.3,
        onStart: () => {
          fragments.forEach((f) => {
            gsap.to(f.mesh.position, {
              x: f.originalX + (Math.random() - 0.5) * 200,
              y: f.originalY + (Math.random() - 0.5) * 200,
              z: (Math.random() - 0.5) * 150,
              duration: 0.5,
              ease: 'power3.out',
            });
            gsap.to(f.mesh.rotation, {
              x: (Math.random() - 0.5) * Math.PI * 2,
              y: (Math.random() - 0.5) * Math.PI * 2,
              z: f.mesh.rotation.z + (Math.random() - 0.5) * Math.PI,
              duration: 0.5,
              ease: 'power3.out',
            });
          });
        },
      }
    );

    // Phase 2: Storm convergence to center
    tl.to(
      {},
      {
        duration: 0.8,
        onStart: () => {
          fragments.forEach((f, i) => {
            gsap.to(f.mesh.position, {
              x: cx + (Math.random() - 0.5) * 20,
              y: cy + (Math.random() - 0.5) * 20,
              z: (Math.random() - 0.5) * 30,
              duration: 1.2,
              delay: i * 0.002,
              ease: 'power4.out',
            });
            // Flatten into paper sheets
            gsap.to(f.mesh.scale, {
              z: 0.05,
              duration: 0.8,
              delay: i * 0.002,
              ease: 'power2.inOut',
            });
          });
        },
      },
      '+=0.2'
    );

    // Phase 3: Curl into scroll
    tl.to(
      {},
      {
        duration: 2,
        onStart: () => {
          fragments.forEach((f, i) => {
            const layer = Math.floor(i / 10);
            const innerRadius = 15 + layer * 8;
            const curlAngle = f.targetAngle + layer * 0.3;

            gsap.to(f.mesh.position, {
              x: Math.cos(curlAngle) * innerRadius,
              y: Math.sin(curlAngle) * innerRadius,
              z: -layer * 2,
              duration: 1.5,
              delay: i * 0.001,
              ease: 'power2.inOut',
            });
            gsap.to(f.mesh.rotation, {
              z: curlAngle + Math.PI / 2,
              x: 0,
              y: 0,
              duration: 1.5,
              delay: i * 0.001,
              ease: 'power2.inOut',
            });
          });
        },
      },
      '+=0.3'
    );

    // Phase 4: Fade out and shrink
    tl.to(
      {},
      {
        duration: 1.5,
        onStart: () => {
          fragments.forEach((f, i) => {
            gsap.to(f.mesh.scale, {
              x: 0.01,
              y: 0.01,
              z: 0.01,
              duration: 1.5,
              delay: i * 0.0005,
              ease: 'power2.in',
            });
            gsap.to((f.mesh.material as THREE.MeshBasicMaterial), {
              opacity: 0,
              duration: 1,
              delay: i * 0.0005,
              ease: 'power2.in',
              onUpdate: function () {
                (f.mesh.material as THREE.MeshBasicMaterial).transparent = true;
              },
            });
          });
        },
      },
      '+=0.5'
    );

    // Spark particles
    const sparkCount = 150;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities: { x: number; y: number; z: number; life: number }[] = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = cx;
      sparkPositions[i * 3 + 1] = cy;
      sparkPositions[i * 3 + 2] = 0;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      sparkVelocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        z: (Math.random() - 0.5) * 3,
        life: 1,
      });
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 3,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // Spark burst during phase 4
    tl.to(
      sparkMat,
      {
        opacity: 1,
        duration: 0.2,
        onStart: () => {
          // Animate sparks
          const sparkAnim = () => {
            const positions = sparkGeo.attributes.position.array as Float32Array;
            let alive = false;

            for (let i = 0; i < sparkCount; i++) {
              const v = sparkVelocities[i];
              if (v.life <= 0) continue;
              alive = true;

              positions[i * 3] += v.x;
              positions[i * 3 + 1] += v.y;
              positions[i * 3 + 2] += v.z;

              v.y -= 0.05; // gravity
              v.x *= 0.99;
              v.life -= 0.015;
            }

            sparkGeo.attributes.position.needsUpdate = true;
            sparkMat.opacity = Math.max(0, sparkMat.opacity - 0.01);

            if (alive && sparkMat.opacity > 0) {
              requestAnimationFrame(sparkAnim);
            }
          };
          sparkAnim();
        },
      },
      '-=1'
    );

    // Render loop
    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      tl.kill();
      fragments.forEach((f) => {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
      sparkGeo.dispose();
      sparkMat.dispose();
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

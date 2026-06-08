"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type HeroShape = "icosahedron" | "sphere" | "torus";

function cssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new THREE.Color(value || fallback);
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const heroCanvas = canvas;

    let accent = cssColor("--accent", "#6f93b3");
    let accent2 = cssColor("--accent-2", "#8aadc4");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    scene.add(group);

    let coreGeo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(2.1, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    let core: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> =
      new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const shellMat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.04,
    });
    let shell: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> =
      new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 1), shellMat);
    group.add(shell);

    let pts: THREE.Points | null = null;
    let ptsMat: THREE.PointsMaterial;

    function buildVertexPoints(geo: THREE.BufferGeometry) {
      if (pts) group.remove(pts);
      ptsMat = new THREE.PointsMaterial({
        color: accent,
        size: 0.12,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      pts = new THREE.Points(geo, ptsMat);
      group.add(pts);
    }

    buildVertexPoints(coreGeo);

    function setShape(kind: HeroShape) {
      group.remove(core);
      group.remove(shell);

      let geometry: THREE.BufferGeometry;
      let shellGeometry: THREE.BufferGeometry;

      if (kind === "torus") {
        geometry = new THREE.TorusKnotGeometry(1.6, 0.42, 120, 16);
        shellGeometry = geometry.clone();
      } else if (kind === "sphere") {
        geometry = new THREE.OctahedronGeometry(2.2, 2);
        shellGeometry = new THREE.OctahedronGeometry(2.15, 2);
      } else {
        geometry = new THREE.IcosahedronGeometry(2.1, 1);
        shellGeometry = new THREE.IcosahedronGeometry(2.05, 1);
      }

      coreGeo = geometry;
      core = new THREE.Mesh(geometry, coreMat);
      shell = new THREE.Mesh(shellGeometry, shellMat);
      group.add(core);
      group.add(shell);
      buildVertexPoints(geometry);
    }

    const ringCount = 90;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringCount * 3);

    for (let i = 0; i < ringCount; i += 1) {
      const angle = (i / ringCount) * Math.PI * 2;
      ringPositions[i * 3] = Math.cos(angle) * 3.4;
      ringPositions[i * 3 + 1] = Math.sin(angle) * 3.4;
      ringPositions[i * 3 + 2] = 0;
    }

    ringGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(ringPositions, 3),
    );

    const ringMat = new THREE.PointsMaterial({
      color: accent2,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Points(ringGeometry, ringMat);
    ring.rotation.x = 1.1;
    ring.rotation.y = 0.4;
    group.add(ring);

    let viewportWidth = window.innerWidth;

    function resize() {
      const parent = heroCanvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      if (width <= 0 || height <= 0) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      heroCanvas.style.width = "100%";
      heroCanvas.style.height = "100%";
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const compact = width <= 900;
      group.position.set(compact ? -0.55 : 0, 0, 0);
      camera.position.z = compact ? 8.4 : 7;
      viewportWidth = width;
    }

    window.addEventListener("resize", resize);
    const parent = heroCanvas.parentElement;
    const resizeObserver =
      parent && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;
    if (parent) resizeObserver?.observe(parent);
    resize();

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    const onMouseMove = (event: MouseEvent) => {
      tx = event.clientX / window.innerWidth - 0.5;
      ty = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", onMouseMove);

    let speed = 1;
    let frameId = 0;
    let time = 0;

    window.__heroSpeed = (value: number) => {
      speed = value;
    };
    window.__heroShape = setShape;
    window.__heroRecolor = () => {
      accent = cssColor("--accent", "#6f93b3");
      accent2 = cssColor("--accent-2", "#8aadc4");
      coreMat.color = accent;
      shellMat.color = accent;
      ptsMat.color = accent;
      ringMat.color = accent2;
      window.__starfieldRecolor?.();
    };

    function animate() {
      frameId = requestAnimationFrame(animate);
      time += 0.005 * speed;
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;

      const compact = viewportWidth <= 900;
      const parallax = compact ? 0.25 : 1;
      const baseScale = compact ? 0.72 : 1;

      group.rotation.y += 0.0016 * speed;
      group.rotation.x = my * 0.5 * parallax;
      group.position.x = (compact ? -0.55 : 0) + mx * 0.8 * parallax;

      core.rotation.y -= 0.0018 * speed;
      shell.rotation.x += 0.0012 * speed;
      if (pts) pts.rotation.copy(core.rotation);
      ring.rotation.z += 0.004 * speed;

      camera.position.x += (mx * 1.4 * parallax - camera.position.x) * 0.04;
      camera.position.y += (-my * 1.0 * parallax - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      const pulse = baseScale * (1 + Math.sin(time * 2) * 0.015);
      group.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      delete window.__heroSpeed;
      delete window.__heroShape;
      delete window.__heroRecolor;
      renderer.dispose();
    };
  }, []);

  return <canvas id="hero-canvas" ref={canvasRef} aria-hidden="true" />;
}

declare global {
  interface Window {
    __heroSpeed?: (value: number) => void;
    __heroShape?: (kind: HeroShape) => void;
    __heroRecolor?: () => void;
  }
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function cssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return new THREE.Color(value || fallback);
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let accent2 = cssColor("--accent-2", "#8aadc4");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);

    const fieldCount = reduce ? 520 : 1600;
    const fieldGeometry = new THREE.BufferGeometry();
    const fieldPositions = new Float32Array(fieldCount * 3);

    for (let i = 0; i < fieldCount; i += 1) {
      const radius = 10 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      fieldPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      fieldPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      fieldPositions[i * 3 + 2] = radius * Math.cos(phi) - 14;
    }

    fieldGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(fieldPositions, 3),
    );

    const fieldMat = new THREE.PointsMaterial({
      color: accent2,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const field = new THREE.Points(fieldGeometry, fieldMat);
    scene.add(field);

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 0 || height <= 0) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let scrollY = 0;

    const onMouseMove = (event: MouseEvent) => {
      tx = event.clientX / window.innerWidth - 0.5;
      ty = event.clientY / window.innerHeight - 0.5;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    let frameId = 0;
    const speed = reduce ? 0.35 : 1;

    window.__starfieldRecolor = () => {
      accent2 = cssColor("--accent-2", "#8aadc4");
      fieldMat.color = accent2;
    };

    function animate() {
      frameId = requestAnimationFrame(animate);
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;

      field.rotation.y += 0.00025 * speed;
      field.rotation.x = my * 0.12;
      field.position.y = scrollY * 0.0008;

      camera.position.x += (mx * 0.9 - camera.position.x) * 0.03;
      camera.position.y += (-my * 0.6 - camera.position.y) * 0.03;
      camera.lookAt(0, scrollY * 0.0004, -6);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      delete window.__starfieldRecolor;
      renderer.dispose();
      fieldGeometry.dispose();
      fieldMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
}

declare global {
  interface Window {
    __starfieldRecolor?: () => void;
  }
}

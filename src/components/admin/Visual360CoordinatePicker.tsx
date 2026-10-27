"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { generateMuseumPanorama } from "@/lib/museum-panorama-generator";
import { generatePanoramaDataUrl } from "@/lib/panorama-generator";
import { Crosshair, Plus, Sparkles, MapPin, Check, Info } from "lucide-react";

interface Visual360CoordinatePickerProps {
  bgType: string;
  isSpaceMode?: boolean;
  spaceId?: string;
  customPanoramaUrl?: string;
  existingMarkers?: { id: string; name: string; pitch: number; yaw: number; emoji?: string }[];
  onAddMarkerAtCoordinate: (coords: { pitch: number; yaw: number }) => void;
}

export default function Visual360CoordinatePicker({
  bgType,
  isSpaceMode = false,
  spaceId,
  customPanoramaUrl,
  existingMarkers = [],
  onAddMarkerAtCoordinate,
}: Visual360CoordinatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCoords, setCurrentCoords] = useState<{ pitch: number; yaw: number }>({ pitch: 0, yaw: 0 });
  const [justAdded, setJustAdded] = useState(false);

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cameraTarget: THREE.Vector3;
    renderer: THREE.WebGLRenderer;
    sphereMesh: THREE.Mesh;
    markersGroup: THREE.Group;
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    targetLat: number;
    targetLon: number;
    lat: number;
    lon: number;
  } | null>(null);

  const latLonToVector3 = useCallback((pitch: number, yaw: number, radius = 450) => {
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(yaw + 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.sin(theta)),
      radius * Math.cos(phi),
      -(radius * Math.sin(phi) * Math.cos(theta))
    );
  }, []);

  // Update markers
  useEffect(() => {
    if (!sceneRef.current) return;
    const { markersGroup } = sceneRef.current;
    markersGroup.clear();

    existingMarkers.forEach((m) => {
      const group = new THREE.Group();
      const pos = latLonToVector3(m.pitch, m.yaw, 420);
      group.position.copy(pos);
      group.lookAt(0, 0, 0);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(12, 18, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Core dot
      const dotGeo = new THREE.CircleGeometry(7, 32);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      group.add(dot);

      markersGroup.add(group);
    });
  }, [existingMarkers, latLonToVector3]);

  // Setup WebGL Picker Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 1, 1100);
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    sphereGeometry.scale(-1, 1, 1);

    const textureUrl =
      customPanoramaUrl ||
      (isSpaceMode && spaceId
        ? generatePanoramaDataUrl(spaceId)
        : generateMuseumPanorama(bgType));

    const sphereTexture = new THREE.TextureLoader().load(textureUrl);
    sphereTexture.colorSpace = THREE.SRGBColorSpace;
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: sphereTexture });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const state = {
      scene,
      camera,
      cameraTarget,
      renderer,
      sphereMesh,
      markersGroup,
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      targetLat: 0,
      targetLon: 0,
      lat: 0,
      lon: 0,
    };
    sceneRef.current = state;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      state.isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      state.prevMouse = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!state.isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - state.prevMouse.x;
      const deltaY = clientY - state.prevMouse.y;

      state.targetLon -= deltaX * 0.2;
      state.targetLat += deltaY * 0.2;
      state.targetLat = Math.max(-85, Math.min(85, state.targetLat));

      state.prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      state.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);

    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.03;

      state.lat += (state.targetLat - state.lat) * 0.15;
      state.lon += (state.targetLon - state.lon) * 0.15;

      const phi = THREE.MathUtils.degToRad(90 - state.lat);
      const theta = THREE.MathUtils.degToRad(state.lon);

      state.cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      state.cameraTarget.y = 500 * Math.cos(phi);
      state.cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(state.cameraTarget);

      // Realtime Yaw (-180 to 180) & Pitch (-90 to 90)
      const rawYaw = Math.round(((state.lon % 360) + 540) % 360) - 180;
      const rawPitch = Math.round(state.lat);
      setCurrentCoords({ pitch: rawPitch, yaw: rawYaw });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onPointerDown);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
      renderer.dispose();
    };
  }, [bgType, isSpaceMode, spaceId, customPanoramaUrl]);

  const handleCapturePoint = () => {
    onAddMarkerAtCoordinate(currentCoords);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-amber-500/40 bg-black select-none shadow-2xl">
      {/* 360 Interactive Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Crosshair Center Aim Target (Tâm ngắm chính giữa) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-400 animate-spin [animation-duration:8s] opacity-80" />
          <Crosshair size={28} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] absolute" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute animate-ping" />
        </div>
      </div>

      {/* Top Banner Guide */}
      <div className="absolute top-3 left-3 right-3 pointer-events-none flex items-center justify-between">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
          <Info size={14} className="text-cyan-400" />
          <span>Kéo chuột xoay ảnh 360° để ngắm tâm vào đồ vật cần thuyết trình</span>
        </div>
      </div>

      {/* Bottom Floating Control Bar (Realtime Coordinates & Pin Button) */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Live Coordinate Badges */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-xs font-mono text-cyan-300 shadow-xl">
          <MapPin size={14} className="text-amber-400" />
          <span>Pitch (Cao độ): <strong className="text-white">{currentCoords.pitch}°</strong></span>
          <span className="text-slate-600">|</span>
          <span>Yaw (Góc xoay): <strong className="text-white">{currentCoords.yaw}°</strong></span>
        </div>

        {/* Capture Button */}
        <button
          onClick={handleCapturePoint}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xl transition-all ${
            justAdded
              ? "bg-emerald-500 text-white animate-bounce"
              : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 hover:scale-105 active:scale-95"
          }`}
        >
          {justAdded ? <Check size={16} /> : <Plus size={16} />}
          <span>{justAdded ? "Đã Chọn Tọa Độ!" : "🎯 Chấm Tọa Độ Này Để Thuyết Trình"}</span>
        </button>
      </div>
    </div>
  );
}

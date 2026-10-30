"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { SpaceData, Hotspot, SPACES_DATA } from "@/data/spaces";
import { generatePanoramaDataUrl } from "@/lib/panorama-generator";
import { spaceAudio } from "@/lib/audio-synth";
import { useDeviceOrientation } from "@/lib/use-device-orientation";
import TransitionWarpEffect from "./TransitionWarpEffect";
import QuizCertificateModal from "../gamification/QuizCertificateModal";
import TreasureBadgeModal from "../gamification/TreasureBadgeModal";
import VirtualSnapshotModal from "./VirtualSnapshotModal";
import MiniMapRadar from "./MiniMapRadar";
import AutoTourGuide from "./AutoTourGuide";
import QuickToolsDrawer from "./QuickToolsDrawer";
import {
  Compass,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Trophy,
  Award,
  Camera,
  Play,
  Landmark,
  Settings,
} from "lucide-react";

interface Viewer360Props {
  space: SpaceData;
  onNavigateSpace: (spaceId: string) => void;
  onOpenChat: () => void;
  onBackToMain?: () => void;
  onOpenMuseumMenu?: () => void;
}

export default function Viewer360({
  space,
  onNavigateSpace,
  onOpenChat,
  onBackToMain,
  onOpenMuseumMenu,
}: Viewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const [coords, setCoords] = useState({ yaw: 0, pitch: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDestName, setTransitionDestName] = useState("");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isAutoTourActive, setIsAutoTourActive] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  const tourSteps = useMemo(() => [
    {
      title: `Tổng Quan Về ${space.name}`,
      description: space.overview,
      pitch: 0,
      yaw: 0,
      audioText: space.audioNarration.transcript,
    },
    ...space.hotspots.map((h) => ({
      title: h.title,
      description: h.description + (h.details?.fact ? ` ${h.details.fact}` : ""),
      pitch: h.pitch,
      yaw: h.yaw,
      audioText: `${h.title}. ${h.description}. ${h.details?.fact || ""}`,
    })),
  ], [space.name, space.overview, space.audioNarration.transcript, space.hotspots]);

  const { active: gyroActive, toggleGyro, orientationRef } = useDeviceOrientation();

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cameraTarget: THREE.Vector3;
    renderer: THREE.WebGLRenderer;
    sphereMesh: THREE.Mesh;
    hotspotObjects: { group: THREE.Group; hotspot: Hotspot }[];
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    targetLat: number;
    targetLon: number;
    lat: number;
    lon: number;
    fov: number;
  } | null>(null);

  // Toggle ambient space audio
  const toggleAmbientSound = () => {
    if (ambientAudioOn) {
      spaceAudio.stopAmbientSound();
      setAmbientAudioOn(false);
    } else {
      spaceAudio.startAmbientSound();
      setAmbientAudioOn(true);
    }
  };

  // Safe warp navigation with smooth transition effect
  const handleWarpToSpace = (targetSpaceId: string) => {
    const targetSpace = SPACES_DATA[targetSpaceId];
    setTransitionDestName(targetSpace ? targetSpace.name : "Không gian mới");
    setIsTransitioning(true);
    spaceAudio.playWarpSound();

    setTimeout(() => {
      onNavigateSpace(targetSpaceId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 500);
  };

  // Pan Camera helper
  const panCamera = (deltaYaw: number, deltaPitch: number) => {
    if (!sceneRef.current) return;
    sceneRef.current.targetLon += deltaYaw;
    sceneRef.current.targetLat = Math.max(-80, Math.min(80, sceneRef.current.targetLat + deltaPitch));
  };

  const handleNavigateToCoords = useCallback((pitch: number, yaw: number) => {
    if (sceneRef.current) {
      sceneRef.current.targetLat = pitch;
      sceneRef.current.targetLon = yaw;
    }
  }, []);

  // Convert (pitch, yaw) in degrees to 3D sphere Cartesian coordinates (Radius 450)
  const latLonToVector3 = useCallback((pitch: number, yaw: number, radius = 450) => {
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(yaw + 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.sin(theta)),
      radius * Math.cos(phi),
      -(radius * Math.sin(phi) * Math.cos(theta))
    );
  }, []);

  // Update sphere panorama texture when space changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { sphereMesh } = sceneRef.current;

    const dataUrl = space.customPanorama || generatePanoramaDataUrl(space.id);
    const loader = new THREE.TextureLoader();
    loader.load(
      dataUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        (sphereMesh.material as THREE.MeshBasicMaterial).map = texture;
        (sphereMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn("Failed to load custom panorama, falling back to procedural:", err);
        const fallbackUrl = generatePanoramaDataUrl(space.id);
        loader.load(fallbackUrl, (fallbackTexture) => {
          fallbackTexture.colorSpace = THREE.SRGBColorSpace;
          (sphereMesh.material as THREE.MeshBasicMaterial).map = fallbackTexture;
          (sphereMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        });
      }
    );
  }, [space.id, space.customPanorama]);

  // Re-build 3D hotspots markers when space.hotspots change
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, hotspotObjects } = sceneRef.current;

    hotspotObjects.forEach((h) => scene.remove(h.group));
    hotspotObjects.length = 0;

    space.hotspots.forEach((spot) => {
      const group = new THREE.Group();
      const pos = latLonToVector3(spot.pitch, spot.yaw, 420);
      group.position.copy(pos);
      group.lookAt(0, 0, 0);

      const ringGeo = new THREE.RingGeometry(9, 13, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spot.category === "portal" ? 0x38bdf8 : spot.category === "discovery" ? 0xf59e0b : 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      const coreGeo = new THREE.CircleGeometry(6, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      group.userData = { hotspot: spot };
      scene.add(group);
      hotspotObjects.push({ group, hotspot: spot });
    });
  }, [space.hotspots, latLonToVector3]);

  // Initialize Three.js WebGL Scene
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

    const initialPanorama = space.customPanorama || generatePanoramaDataUrl(space.id);
    const sphereTexture = new THREE.TextureLoader().load(initialPanorama);
    sphereTexture.colorSpace = THREE.SRGBColorSpace;
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: sphereTexture });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const state = {
      scene,
      camera,
      cameraTarget,
      renderer,
      sphereMesh,
      hotspotObjects: [] as { group: THREE.Group; hotspot: Hotspot }[],
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      targetLat: 0,
      targetLon: 0,
      lat: 0,
      lon: 0,
      fov: 65,
    };
    sceneRef.current = state;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

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

      state.targetLon -= deltaX * 0.15;
      state.targetLat += deltaY * 0.15;
      state.targetLat = Math.max(-85, Math.min(85, state.targetLat));

      state.prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      state.isDragging = false;

      if ("clientX" in e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, camera);
        const interactiveMeshes = state.hotspotObjects.map((h) => h.group);
        const intersects = raycaster.intersectObjects(interactiveMeshes, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData.hotspot && topObj.parent) {
            topObj = topObj.parent;
          }
          if (topObj && topObj.userData.hotspot) {
            const spot = topObj.userData.hotspot as Hotspot;
            if (spot.category === "portal" && spot.targetSpaceId) {
              handleWarpToSpace(spot.targetSpaceId);
            } else {
              spaceAudio.playWarpSound();
              setSelectedHotspot(spot);
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.fov += e.deltaY * 0.05;
      state.fov = Math.max(30, Math.min(90, state.fov));
      camera.fov = state.fov;
      camera.updateProjectionMatrix();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.02;

      // Handle Device Orientation Gyroscope mode if active
      if (gyroActive && orientationRef.current) {
        const { alpha, beta } = orientationRef.current;
        state.targetLon = -alpha;
        state.targetLat = beta - 90;
      } else if (autoRotate && !state.isDragging) {
        state.targetLon += 0.08;
      }

      state.lat += (state.targetLat - state.lat) * 0.1;
      state.lon += (state.targetLon - state.lon) * 0.1;

      const phi = THREE.MathUtils.degToRad(90 - state.lat);
      const theta = THREE.MathUtils.degToRad(state.lon);

      state.cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      state.cameraTarget.y = 500 * Math.cos(phi);
      state.cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(state.cameraTarget);

      state.hotspotObjects.forEach((h, idx) => {
        const pulse = 1 + Math.sin(clock * 3.5 + idx) * 0.16;
        h.group.scale.set(pulse, pulse, pulse);
      });

      const newYaw = Math.round(((state.lon % 360) + 360) % 360);
      const newPitch = Math.round(state.lat);
      setCoords((prev) => (prev.yaw !== newYaw || prev.pitch !== newPitch ? { yaw: newYaw, pitch: newPitch } : prev));

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
      dom.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [space.id, autoRotate, gyroActive, latLonToVector3]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const spacesList = useMemo(() => Object.values(SPACES_DATA), []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black">
      {/* Dynamic Warp Transition Screen */}
      <TransitionWarpEffect
        isTransitioning={isTransitioning}
        destinationName={transitionDestName}
        themeColor={space.themeColor}
      />

      {/* 360 WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Unified Navigation & Action Bar */}
      <div className="fixed top-0 inset-x-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 sm:px-6 pb-2 pointer-events-none flex items-center justify-between gap-2">
        {/* Left: Back + Location Pill + Switch to Museum */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-2xl bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-xl shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold hover:scale-105 active:scale-95 transition"
              title="Quay lại mô hình 3D Hệ Mặt Trời"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Mô Hình 3D</span>
            </button>
          )}

          {/* Space Info Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 px-3 py-2 rounded-2xl shadow-xl text-white">
            <img
              src="/logo.png"
              alt="Logo THCS Lê Anh Xuân"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full shrink-0 border border-cyan-400/40 bg-white/10"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">
                  {space.name}
                </h1>
                <span className="hidden md:inline text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Sky Lab 360°
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 truncate">{space.nameEn}</p>
            </div>
          </div>

          {/* Quick Switch to Museum */}
          {onOpenMuseumMenu && (
            <button
              onClick={onOpenMuseumMenu}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-600/90 hover:bg-amber-500 text-white border border-amber-400/80 backdrop-blur-xl shadow-xl text-xs font-bold hover:scale-105 active:scale-95 transition shrink-0"
              title="Khám phá các bảo tàng lịch sử & văn hoá"
            >
              <Landmark size={15} />
              <span className="hidden xs:inline">🏛️ Bảo Tàng</span>
            </button>
          )}
        </div>

        {/* Right: AI Chat + Quick Tools Drawer Trigger */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Auto Tour quick shortcut on desktop */}
          <button
            onClick={() => setIsAutoTourActive((prev) => !prev)}
            className={`hidden lg:flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-2xl border backdrop-blur-xl text-xs font-bold transition shadow-xl ${
              isAutoTourActive
                ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800"
            }`}
            title="Tour tự động giới thiệu toàn cảnh"
          >
            <Play size={14} />
            <span>{isAutoTourActive ? "Đang Chạy Tour" : "Tour Tự Động"}</span>
          </button>

          {/* Quiz quick shortcut on desktop */}
          <button
            onClick={() => setIsQuizOpen(true)}
            className="hidden xl:flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition border border-yellow-300"
            title="Thử thách trắc nghiệm nhận chứng chỉ"
          >
            <Trophy size={15} />
            <span>Đố Vui</span>
          </button>

          {/* Primary CTA: Ask AI Tutor */}
          <button
            onClick={onOpenChat}
            className="min-h-[44px] flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition border border-cyan-300 shrink-0"
          >
            <Sparkles size={16} />
            <span className="hidden xs:inline">Gia Sư AI</span>
            <span className="xs:hidden">AI</span>
          </button>

          {/* THE MASTER BUTTON: Quick Tools Drawer (Tiện Ích) */}
          <button
            onClick={() => setIsToolsDrawerOpen(true)}
            className="relative min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-slate-900/95 text-slate-200 hover:text-white border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-xl shadow-xl text-xs font-bold hover:scale-105 active:scale-95 transition shrink-0"
            title="Mở bảng tiện ích & công cụ điều khiển 360°"
          >
            <Settings size={16} className="text-cyan-400" />
            <span className="hidden sm:inline">Tiện Ích</span>
            {(gyroActive || ambientAudioOn || autoRotate) && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mini-Map Radar HUD (toggleable) */}
      {showRadar && (
        <MiniMapRadar
          currentYaw={coords.yaw}
          currentPitch={coords.pitch}
          currentTitle={space.name}
          items={spacesList.map((s) => ({
            id: s.id,
            name: s.name,
            emoji: s.aiContext.avatarEmoji,
          }))}
          onSelectItem={(id) => handleWarpToSpace(id)}
          accentColor="cyan"
          onClose={() => setShowRadar(false)}
        />
      )}

      {/* Auto Tour Guide Component */}
      <AutoTourGuide
        isActive={isAutoTourActive}
        onStop={() => setIsAutoTourActive(false)}
        title={`Khám Phá Toàn Cảnh: ${space.name}`}
        steps={tourSteps}
        onNavigateToCoords={handleNavigateToCoords}
        accentColor="cyan"
      />

      {/* Quiz & Certificate Modal */}
      <QuizCertificateModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        space={space}
      />

      {/* Treasure Badge Modal */}
      <TreasureBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        unlockedBadgeIds={["badge-sun", "badge-mars", "badge-iss", "badge-quiz-master"]}
      />

      {/* Virtual Snapshot Modal */}
      <VirtualSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        title={space.name}
        subtitle={`${space.nameEn} • ${space.tagline}`}
        coords={coords}
        isSpaceMode={true}
      />

      {/* Floating Hotspots Quick Pills (Left Side) */}
      <div className="absolute top-28 left-6 z-20 hidden md:flex flex-col gap-2 max-w-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 px-2 flex items-center gap-1.5">
          <Layers size={13} />
          Điểm khám phá trong không gian:
        </span>
        {space.hotspots.map((spot) => (
          <button
            key={`spot-pill-${spot.id}`}
            onClick={() => {
              if (spot.category === "portal" && spot.targetSpaceId) {
                handleWarpToSpace(spot.targetSpaceId);
              } else {
                spaceAudio.playWarpSound();
                setSelectedHotspot(spot);
              }
            }}
            className="group flex items-center gap-2.5 p-2 rounded-2xl bg-slate-900/85 hover:bg-cyan-950/80 border border-cyan-500/40 hover:border-cyan-400 shadow-xl backdrop-blur-md text-left transition-all hover:scale-102"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              {spot.category === "portal" ? <ArrowRight size={15} /> : <Sparkles size={15} />}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate">
                {spot.title}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">{spot.badge || "Khám phá"}</p>
            </div>
          </button>
        ))}
      </div>


      {/* Directional Look Controls (Pan Camera) - Desktop/Tablet HUD */}
      <div className="hidden sm:flex absolute bottom-20 sm:bottom-24 right-4 sm:right-6 z-20 flex-col items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl">
        <button
          onClick={() => panCamera(0, 15)}
          className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
          title="Nhìn lên"
        >
          <ChevronUp size={16} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => panCamera(25, 0)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            title="Xoay trái"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => panCamera(-25, 0)}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            title="Xoay phải"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => panCamera(0, -15)}
          className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
          title="Nhìn xuống"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Compass HUD */}
      <div className="absolute bottom-20 left-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-slate-300 pointer-events-none">
        <Compass size={14} className="text-cyan-400 animate-pulse" />
        <span>Góc nhìn: {coords.yaw}° | Cao độ: {coords.pitch}°</span>
      </div>

      {/* Quick Space Selector Bar at Bottom */}
      <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none px-3">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl max-w-[95vw] sm:max-w-2xl overflow-x-auto no-scrollbar scroll-smooth pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {spacesList.map((s) => {
            const isCurrent = s.id === space.id;
            return (
              <button
                key={`nav-${s.id}`}
                onClick={() => handleWarpToSpace(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                  isCurrent
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/40 scale-105"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{s.aiContext.avatarEmoji}</span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hotspot Fact Popup Modal (Mobile Bottom Sheet / Desktop Modal) */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[85vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button
              onClick={() => setSelectedHotspot(null)}
              className="absolute top-4 right-4 min-h-[36px] min-w-[36px] p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                {selectedHotspot.category === "portal" ? (
                  <ArrowRight size={20} />
                ) : selectedHotspot.category === "discovery" ? (
                  <Sparkles size={20} />
                ) : (
                  <Info size={20} />
                )}
              </span>
              <div>
                {selectedHotspot.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-300">
                    {selectedHotspot.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedHotspot.title}</h3>
              </div>
            </div>

            {(selectedHotspot.image || selectedHotspot.details?.image) && (
              <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-cyan-500/30 mb-3 bg-slate-950 shadow-inner group">
                <img
                  src={selectedHotspot.image || selectedHotspot.details?.image}
                  alt={selectedHotspot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                  <Sparkles size={10} /> Ảnh tư liệu
                </div>
              </div>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">{selectedHotspot.description}</p>

            {selectedHotspot.details && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-cyan-200">
                  <Info size={15} className="mt-0.5 shrink-0 text-cyan-400" />
                  <span>{selectedHotspot.details.fact}</span>
                </div>
                {selectedHotspot.details.funFact && (
                  <div className="flex items-start gap-2 text-amber-200">
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-400" />
                    <span>{selectedHotspot.details.funFact}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedHotspot(null);
                  onOpenChat();
                }}
                className="min-h-[40px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/50 border border-cyan-500/40 text-xs font-semibold transition"
              >
                <HelpCircle size={14} />
                Hỏi thêm AI về chủ đề này
              </button>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tools Drawer (Mobile Action Center) */}
      <QuickToolsDrawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        gyroActive={gyroActive}
        onToggleGyro={toggleGyro}
        ambientAudioOn={ambientAudioOn}
        onToggleAmbientAudio={toggleAmbientSound}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        showRadar={showRadar}
        onToggleRadar={() => setShowRadar((prev) => !prev)}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onOpenBadges={() => setIsBadgeModalOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        isAutoTourActive={isAutoTourActive}
        onToggleAutoTour={() => setIsAutoTourActive((prev) => !prev)}
        onOpenChat={onOpenChat}
        onBackToMain={onBackToMain}
        onSwitchMode={onOpenMuseumMenu}
        switchModeLabel="Khám Phá Bảo Tàng Lịch Sử 360°"
        accentColor="cyan"
        isSpaceMode={true}
      />
    </div>
  );
}

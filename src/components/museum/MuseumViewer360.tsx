"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { MuseumRoom, MuseumArtifact, FloorNavigationLink } from "@/data/museum-spaces";
import { MuseumSite } from "@/data/museums-directory";
import { generateMuseumPanorama } from "@/lib/museum-panorama-generator";
import { spaceAudio } from "@/lib/audio-synth";
import { useDeviceOrientation } from "@/lib/use-device-orientation";
import TransitionWarpEffect from "../tour/TransitionWarpEffect";
import Artifact3DInspector from "./Artifact3DInspector";
import MuseumSelectorMenu from "./MuseumSelectorMenu";
import QuizCertificateModal from "../gamification/QuizCertificateModal";
import TreasureBadgeModal from "../gamification/TreasureBadgeModal";
import VirtualSnapshotModal from "../tour/VirtualSnapshotModal";
import MiniMapRadar from "../tour/MiniMapRadar";
import AutoTourGuide from "../tour/AutoTourGuide";
import QuickToolsDrawer from "../tour/QuickToolsDrawer";
import {
  Compass,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  Pause,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MapPin,
  HelpCircle,
  X,
  History,
  Footprints,
  Landmark,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
  Smartphone,
  Building,
  Trophy,
  Award,
  Camera,
  Play,
  Orbit,
  Settings,
} from "lucide-react";

interface MuseumViewer360Props {
  currentMuseum: MuseumSite;
  currentRoom: MuseumRoom;
  allMuseums: Record<string, MuseumSite>;
  onSelectMuseum: (museumId: string, roomId?: string) => void;
  onNavigateRoom: (roomId: string) => void;
  onBackToMain: () => void;
}

export default function MuseumViewer360({
  currentMuseum,
  currentRoom,
  allMuseums,
  onSelectMuseum,
  onNavigateRoom,
  onBackToMain,
}: MuseumViewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<MuseumArtifact | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isMuseumMenuOpen, setIsMuseumMenuOpen] = useState(false);
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
      title: `Chào Mừng Đến ${currentRoom.name}`,
      description: currentRoom.subtitle,
      pitch: 0,
      yaw: 0,
      audioText: currentRoom.audioNarration.transcript,
    },
    ...(currentRoom.artifacts || []).map((art) => ({
      title: art.name,
      description: `${art.shortSummary} ${art.historicalStory}`,
      pitch: art.pitch,
      yaw: art.yaw,
      audioText: `${art.name}. ${art.audioGuideText}. ${art.historicalStory}`,
    })),
  ], [currentRoom.name, currentRoom.subtitle, currentRoom.audioNarration.transcript, currentRoom.artifacts]);

  const { active: gyroActive, toggleGyro, orientationRef } = useDeviceOrientation();

  // Audio Narration State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string; time: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cameraTarget: THREE.Vector3;
    renderer: THREE.WebGLRenderer;
    sphereMesh: THREE.Mesh;
    interactiveObjects: {
      group: THREE.Group;
      type: "artifact" | "floor_arrow";
      data: MuseumArtifact | FloorNavigationLink;
    }[];
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    targetLat: number;
    targetLon: number;
    lat: number;
    lon: number;
    fov: number;
  } | null>(null);

  // Stop any audio when room changes
  useEffect(() => {
    spaceAudio.stopSpeech();
    setIsAudioPlaying(false);
    setSelectedArtifact(null);

    const guide = currentRoom.aiGuide;
    setChatMessages([
      {
        id: "welcome-" + currentRoom.id,
        role: "assistant",
        content: `Kính chào quý khách đến với **${currentMuseum.name}**!\nTôi là **${guide.name}** (${guide.avatar}) - ${guide.title}.\n\n${guide.welcomeMessage}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [currentRoom, currentMuseum]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Safe warp navigation between rooms
  const handleWarpToRoom = (targetRoomId: string) => {
    const targetRoom = currentMuseum.rooms[targetRoomId];
    setTransitionDestName(targetRoom ? targetRoom.name : "Gian phòng mới");
    setIsTransitioning(true);
    spaceAudio.playWarpSound();

    setTimeout(() => {
      onNavigateRoom(targetRoomId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 500);
  };

  // Handle Voice Narration for current room
  const handleToggleRoomAudio = () => {
    if (isAudioPlaying) {
      spaceAudio.stopSpeech();
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      spaceAudio.speakNarration(
        currentRoom.audioNarration.transcript,
        (progress) => setAudioProgress(progress),
        () => {
          setIsAudioPlaying(false);
          setAudioProgress(0);
        }
      );
    }
  };

  // Convert (pitch, yaw) to 3D sphere coordinate
  const latLonToVector3 = useCallback((pitch: number, yaw: number, radius = 450) => {
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(yaw + 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.sin(theta)),
      radius * Math.cos(phi),
      -(radius * Math.sin(phi) * Math.cos(theta))
    );
  }, []);

  // Pan Camera helper for directional controls
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

  // Update sphere texture when room changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { sphereMesh } = sceneRef.current;
    const dataUrl = currentRoom.customPanorama || generateMuseumPanorama(currentRoom.bgType);
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
        console.warn("Failed to load custom museum panorama, falling back to procedural:", err);
        const fallbackUrl = generateMuseumPanorama(currentRoom.bgType);
        loader.load(fallbackUrl, (fallbackTexture) => {
          fallbackTexture.colorSpace = THREE.SRGBColorSpace;
          (sphereMesh.material as THREE.MeshBasicMaterial).map = fallbackTexture;
          (sphereMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        });
      }
    );
  }, [currentRoom.id, currentRoom.bgType, currentRoom.customPanorama]);

  // Re-build 3D Artifacts and Floor Navigation Markers
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, interactiveObjects } = sceneRef.current;

    interactiveObjects.forEach((item) => scene.remove(item.group));
    interactiveObjects.length = 0;

    // 1. Floor Navigation Rings
    (currentRoom.navigationLinks || []).forEach((nav) => {
      const group = new THREE.Group();
      const pos = latLonToVector3(nav.pitch, nav.yaw, 380);
      group.position.copy(pos);
      group.lookAt(0, 0, 0);

      const ringGeo = new THREE.RingGeometry(16, 24, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      const innerGeo = new THREE.CircleGeometry(13, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      group.add(innerMesh);

      group.userData = { type: "floor_arrow", data: nav };
      scene.add(group);
      interactiveObjects.push({ group, type: "floor_arrow", data: nav });
    });

    // 2. Artifact Hotspot Markers
    (currentRoom.artifacts || []).forEach((artifact) => {
      const group = new THREE.Group();
      const pos = latLonToVector3(artifact.pitch, artifact.yaw, 420);
      group.position.copy(pos);
      group.lookAt(0, 0, 0);

      const ringGeo = new THREE.RingGeometry(14, 20, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      const coreGeo = new THREE.CircleGeometry(10, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        side: THREE.DoubleSide,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      group.userData = { type: "artifact", data: artifact };
      scene.add(group);
      interactiveObjects.push({ group, type: "artifact", data: artifact });
    });
  }, [currentRoom, latLonToVector3]);

  // Setup WebGL Scene
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

    const initialPanorama = currentRoom.customPanorama || generateMuseumPanorama(currentRoom.bgType);
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
      interactiveObjects: [] as {
        group: THREE.Group;
        type: "artifact" | "floor_arrow";
        data: MuseumArtifact | FloorNavigationLink;
      }[],
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      targetLat: -5,
      targetLon: 0,
      lat: -5,
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
        const meshes = state.interactiveObjects.map((i) => i.group);
        const intersects = raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData.type && topObj.parent) {
            topObj = topObj.parent;
          }
          if (topObj && topObj.userData.type) {
            if (topObj.userData.type === "floor_arrow") {
              const nav = topObj.userData.data as FloorNavigationLink;
              handleWarpToRoom(nav.targetRoomId);
            } else if (topObj.userData.type === "artifact") {
              spaceAudio.playWarpSound();
              const artifact = topObj.userData.data as MuseumArtifact;
              setSelectedArtifact(artifact);
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.fov += e.deltaY * 0.05;
      state.fov = Math.max(35, Math.min(90, state.fov));
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
      clock += 0.025;

      if (gyroActive && orientationRef.current) {
        const { alpha, beta } = orientationRef.current;
        state.targetLon = -alpha;
        state.targetLat = beta - 90;
      } else if (autoRotate && !state.isDragging) {
        state.targetLon += 0.06;
      }

      state.lat += (state.targetLat - state.lat) * 0.1;
      state.lon += (state.targetLon - state.lon) * 0.1;

      const phi = THREE.MathUtils.degToRad(90 - state.lat);
      const theta = THREE.MathUtils.degToRad(state.lon);

      state.cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      state.cameraTarget.y = 500 * Math.cos(phi);
      state.cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(state.cameraTarget);

      state.interactiveObjects.forEach((item, idx) => {
        const pulse = 1 + Math.sin(clock * 3.5 + idx) * 0.18;
        item.group.scale.set(pulse, pulse, pulse);
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
  }, [currentRoom.bgType, autoRotate, gyroActive, latLonToVector3]);

  const handleSendChatMessage = async (customText?: string) => {
    const q = (customText || chatInput).trim();
    if (!q || isChatLoading) return;

    const userMsg = {
      id: "u-" + Date.now(),
      role: "user" as const,
      content: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          spaceId: "museum-" + currentRoom.id,
          history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || `Hướng dẫn viên ${currentRoom.aiGuide.name} đã ghi nhận câu hỏi của bạn.`;

      setChatMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Không thể kết nối hướng dẫn viên lúc này. Xin thử lại!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentMuseumRoomsList = useMemo(() => Object.values(currentMuseum.rooms || {}), [currentMuseum]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-stone-950">
      {/* Museum Selector Menu Modal */}
      <MuseumSelectorMenu
        isOpen={isMuseumMenuOpen}
        onClose={() => setIsMuseumMenuOpen(false)}
        museums={allMuseums}
        currentMuseumId={currentMuseum.id}
        onSelectMuseum={onSelectMuseum}
      />

      {/* Warp Transition Screen */}
      <TransitionWarpEffect
        isTransitioning={isTransitioning}
        destinationName={transitionDestName}
        themeColor={currentRoom.themeColor}
      />

      {/* 360 WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Unified Navigation & Action Bar */}
      <div className="fixed top-0 inset-x-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 sm:px-6 pb-2 pointer-events-none flex items-center justify-between gap-2">
        {/* Left: Back to Solar + Room Badge + Change Museum */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onBackToMain}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-2xl bg-stone-900/90 text-stone-300 hover:text-white border border-stone-700/80 backdrop-blur-xl shadow-xl flex items-center justify-center gap-1.5 text-xs font-semibold hover:scale-105 active:scale-95 transition"
            title="Quay lại Hệ Mặt Trời 3D"
          >
            <Orbit size={16} className="text-cyan-400" />
            <span className="hidden sm:inline">Hệ Mặt Trời</span>
          </button>

          {/* Room & Museum Badge */}
          <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-xl border border-amber-500/40 px-3 py-2 rounded-2xl shadow-xl text-white">
            <img
              src="/logo.png"
              alt="Logo THCS Lê Anh Xuân"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full shrink-0 border border-amber-400/40 bg-white/10"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-amber-200 truncate max-w-[95px] xs:max-w-[140px] sm:max-w-none">
                  {currentRoom.name}
                </h1>
                <span className="hidden md:inline text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sky Lab 360°
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-stone-400 truncate">{currentMuseum.name}</p>
            </div>
          </div>

          {/* Change Museum Button */}
          <button
            onClick={() => setIsMuseumMenuOpen(true)}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition border border-yellow-300 shrink-0"
            title="Chọn Sky Lab khác"
          >
            <Building size={15} />
            <span className="hidden xs:inline">Đổi Sky Lab</span>
          </button>
        </div>

        {/* Right: AutoTour (lg+), Quiz (xl+), AI Chat + Quick Tools Drawer Trigger */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop shortcut: AutoTour */}
          <button
            onClick={() => setIsAutoTourActive((prev) => !prev)}
            className={`hidden lg:flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-2xl border backdrop-blur-xl text-xs font-bold transition shadow-xl ${
              isAutoTourActive
                ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                : "bg-stone-900/90 text-amber-200 border-amber-500/30 hover:bg-stone-800"
            }`}
            title="Tour tự động tham quan gian phòng"
          >
            <Play size={14} />
            <span>{isAutoTourActive ? "Đang Chạy Tour" : "Tour Tự Động"}</span>
          </button>

          {/* Desktop shortcut: Quiz */}
          <button
            onClick={() => setIsQuizOpen(true)}
            className="hidden xl:flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition border border-yellow-300"
            title="Thử thách trắc nghiệm di sản nhận chứng chỉ"
          >
            <Trophy size={15} />
            <span>Đố Vui</span>
          </button>

          {/* Primary CTA: Ask AI Guide */}
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="min-h-[44px] flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-600/30 hover:scale-105 active:scale-95 transition border border-amber-400 shrink-0"
          >
            <Sparkles size={16} />
            <span className="hidden xs:inline">Hướng Dẫn Viên</span>
            <span className="xs:hidden">HDV AI</span>
          </button>

          {/* THE MASTER BUTTON: Quick Tools Drawer (Tiện Ích) */}
          <button
            onClick={() => setIsToolsDrawerOpen(true)}
            className="relative min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-stone-900/95 text-stone-200 hover:text-white border border-amber-500/40 hover:border-amber-400 backdrop-blur-xl shadow-xl text-xs font-bold hover:scale-105 active:scale-95 transition shrink-0"
            title="Mở bảng tiện ích & công cụ điều khiển 360°"
          >
            <Settings size={16} className="text-amber-400" />
            <span className="hidden sm:inline">Tiện Ích</span>
            {(gyroActive || autoRotate) && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Google Street View Direct Walking Arrows (Floor navigation) */}
      {(currentRoom.navigationLinks || []).length > 0 && (
        <div className="fixed bottom-18 sm:bottom-22 inset-x-0 z-25 flex justify-center pointer-events-none px-3">
          <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[92vw] sm:max-w-xl py-1">
            {currentRoom.navigationLinks.map((nav, idx) => {
              return (
                <button
                  key={`navlink-${idx}`}
                  onClick={() => handleWarpToRoom(nav.targetRoomId)}
                  className="group flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl bg-cyan-950/90 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-400/50 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 min-h-[38px]"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/30 group-hover:bg-white text-cyan-300 group-hover:text-cyan-700 flex items-center justify-center shrink-0">
                    {nav.direction === "forward" && <ArrowUp size={13} className="animate-bounce" />}
                    {nav.direction === "backward" && <ArrowDown size={13} />}
                    {nav.direction === "left" && <ArrowLeft size={13} />}
                    {nav.direction === "right" && <ArrowRight size={13} />}
                  </div>
                  <span className="text-xs font-bold tracking-tight whitespace-nowrap">{nav.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Artifact Cards (Left Side) */}
      {(currentRoom.artifacts || []).length > 0 && (
        <div className="absolute top-28 left-6 z-20 hidden md:flex flex-col gap-2 max-w-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 px-2 flex items-center gap-1.5">
            <BookOpen size={13} />
            Hiện vật trong gian phòng:
          </span>
          {currentRoom.artifacts.map((artifact) => (
            <button
              key={`art-card-${artifact.id}`}
              onClick={() => {
                spaceAudio.playWarpSound();
                setSelectedArtifact(artifact);
              }}
              className="group flex items-center gap-3 p-2.5 rounded-2xl bg-stone-900/85 hover:bg-amber-950/80 border border-amber-500/40 hover:border-amber-400 shadow-xl backdrop-blur-md text-left transition-all hover:scale-102"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition">
                {artifact.thumbnailEmoji}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-amber-100 group-hover:text-amber-300 truncate">
                  {artifact.name}
                </h3>
                <p className="text-[11px] text-stone-400 truncate">{artifact.era}</p>
              </div>
              <div className="ml-auto text-amber-400 opacity-60 group-hover:opacity-100">
                <Eye size={15} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Room Selector Bar */}
      <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none px-3">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl max-w-[95vw] sm:max-w-2xl overflow-x-auto no-scrollbar scroll-smooth pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1.5 shrink-0 flex items-center gap-1">
            <MapPin size={12} /> Phòng:
          </span>
          {currentMuseumRoomsList.map((room) => {
            const isCurrent = room.id === currentRoom.id;
            return (
              <button
                key={`room-${room.id}`}
                onClick={() => handleWarpToRoom(room.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[36px] ${
                  isCurrent
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/40 scale-105"
                    : "bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white"
                }`}
              >
                <span>{room.aiGuide.avatar}</span>
                <span>{room.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artifact Story Modal (Mobile Bottom Sheet / Desktop Modal) */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/50 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[88vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button
              onClick={() => {
                spaceAudio.stopSpeech();
                setSelectedArtifact(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition z-10"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {selectedArtifact.thumbnailEmoji}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedArtifact.era}
                </span>
                <h2 className="text-base sm:text-xl font-bold text-amber-100 mt-1">
                  {selectedArtifact.name}
                </h2>
                <p className="text-xs text-stone-300 mt-0.5">{selectedArtifact.shortSummary}</p>
              </div>
            </div>

            {selectedArtifact.image ? (
              <div className="my-3 space-y-2">
                <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-950 shadow-inner group">
                  <img
                    src={selectedArtifact.image}
                    alt={selectedArtifact.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-[10px] font-mono text-amber-300 flex items-center gap-1 border border-amber-500/30">
                    <Sparkles size={11} className="text-amber-400" /> Ảnh chụp hiện vật thực tế
                  </div>
                </div>
                <details className="text-xs text-amber-300/80 bg-stone-950/60 rounded-xl p-2 border border-stone-800">
                  <summary className="cursor-pointer font-semibold flex items-center gap-1">
                    <span>🔍 Xem Mô Hình 3D Mô Phỏng</span>
                  </summary>
                  <div className="mt-2">
                    <Artifact3DInspector artifactId={selectedArtifact.id} />
                  </div>
                </details>
              </div>
            ) : (
              <div className="my-3">
                <Artifact3DInspector artifactId={selectedArtifact.id} />
              </div>
            )}

            <div className="space-y-3 my-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5 text-xs sm:text-sm leading-relaxed text-stone-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <History size={14} />
                  <span>Câu Chuyện Lịch Sử:</span>
                </div>
                <p className="text-justify">{selectedArtifact.historicalStory}</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/40 flex items-start gap-2 text-xs text-amber-200">
                <Sparkles size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Bí ẩn thú vị: </strong>
                  <span>{selectedArtifact.funFact}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  spaceAudio.speakNarration(
                    selectedArtifact.audioGuideText + ". " + selectedArtifact.historicalStory
                  );
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                <Volume2 size={15} />
                <span>Nghe Thuyết Minh</span>
              </button>

              <button
                onClick={() => {
                  const artName = selectedArtifact.name;
                  setSelectedArtifact(null);
                  setIsAiChatOpen(true);
                  handleSendChatMessage(`Kể cho tôi nghe thêm về hiện vật ${artName}`);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold border border-stone-700 transition"
              >
                <HelpCircle size={15} />
                <span>Hỏi Thêm AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat */}
      {isAiChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-stone-950/95 border-l border-amber-500/30 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-300 animate-slide-left">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
                {currentRoom.aiGuide.avatar}
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-100">{currentRoom.aiGuide.name}</h2>
                <p className="text-xs text-stone-400">{currentMuseum.name}</p>
              </div>
            </div>

            <button
              onClick={() => setIsAiChatOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-base mt-1">
                      {currentRoom.aiGuide.avatar}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-amber-600 text-white rounded-tr-none"
                        : "bg-stone-900 text-stone-100 border border-stone-800 rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                    <div className="mt-2 text-[10px] text-stone-400">{m.time}</div>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex gap-3 items-center text-amber-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span>Hướng dẫn viên đang tra cứu tư liệu...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-stone-800 bg-stone-900/50">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {currentRoom.aiGuide.suggestedQuestions.map((q, i) => (
                <button
                  key={`q-${i}`}
                  onClick={() => handleSendChatMessage(q)}
                  className="text-xs px-3 py-1 rounded-full bg-stone-800 hover:bg-amber-600/30 text-stone-300 border border-stone-700 transition"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-stone-800 bg-stone-900/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về lịch sử, bảo tàng..."
                className="flex-1 bg-stone-800 border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 transition"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MiniMap Radar HUD (toggleable) */}
      {showRadar && (
        <MiniMapRadar
          currentYaw={coords.yaw}
          currentPitch={coords.pitch}
          currentTitle={currentRoom.name}
          items={Object.values(currentMuseum.rooms || {}).map((r) => ({
            id: r.id,
            name: r.name,
            emoji: "🏛️",
          }))}
          onSelectItem={(id) => handleWarpToRoom(id)}
          accentColor="amber"
          onClose={() => setShowRadar(false)}
        />
      )}

      {/* Auto Tour Guide Component */}
      <AutoTourGuide
        isActive={isAutoTourActive}
        onStop={() => setIsAutoTourActive(false)}
        title={`${currentMuseum.name} - ${currentRoom.name}`}
        steps={tourSteps}
        onNavigateToCoords={handleNavigateToCoords}
        accentColor="amber"
      />

      {/* Quiz & Certificate Modal */}
      <QuizCertificateModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        room={currentRoom}
        museumName={currentMuseum.name}
      />

      {/* Treasure Badge Modal */}
      <TreasureBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        unlockedBadgeIds={["badge-drum", "badge-mic-1945", "badge-quiz-master"]}
      />

      {/* Virtual Snapshot Modal */}
      <VirtualSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        title={currentRoom.name}
        subtitle={`${currentMuseum.name} • ${currentRoom.subtitle}`}
        coords={coords}
        isSpaceMode={false}
      />

      {/* Quick Tools Drawer (Mobile Action Center) */}
      <QuickToolsDrawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        gyroActive={gyroActive}
        onToggleGyro={toggleGyro}
        ambientAudioOn={false}
        onToggleAmbientAudio={() => {}}
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
        onOpenChat={() => setIsAiChatOpen(true)}
        onBackToMain={onBackToMain}
        onSwitchMode={() => setIsMuseumMenuOpen(true)}
        switchModeLabel="Chọn Bảo Tàng Khác"
        accentColor="amber"
        isSpaceMode={false}
      />
    </div>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { ZoomIn, ZoomOut, Sun, Volume2, Sparkles, Award } from "lucide-react";
import { spaceAudio } from "@/lib/audio-synth";

interface Artifact3DInspectorProps {
  artifactId: string;
}

function ArtifactMesh({
  artifactId,
  zoomLevel,
}: {
  artifactId: string;
  zoomLevel: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  // Render procedural 3D models with dynamic scaling
  return (
    <group scale={zoomLevel}>
      {artifactId === "dong-son-drum" && (
        <group ref={meshRef}>
          {/* Drum Tympanum / Top Disc */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
            <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Sun Star Relief */}
          <mesh position={[0, 1.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 0.75, 14]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Concentric Bird / Lạc bird rings */}
          <mesh position={[0, 1.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.4, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Drum Body */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[1.4, 1.7, 1.4, 32]} />
            <meshStandardMaterial color="#92400e" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Drum Base */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[1.9, 1.4, 0.8, 32]} />
            <meshStandardMaterial color="#78350f" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Handles */}
          <mesh position={[1.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.3, 0.08, 16, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} />
          </mesh>
          <mesh position={[-1.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.3, 0.08, 16, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} />
          </mesh>
        </group>
      )}

      {artifactId === "historical-mic-1945" && (
        <group ref={meshRef}>
          {/* Mic Capsule */}
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.9, 1.2, 0.7]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.8, 0.36]}>
            <planeGeometry args={[0.8, 1.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.8} />
          </mesh>
          {/* Stem & Base */}
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -1.35, 0]}>
            <cylinderGeometry args={[0.9, 1.0, 0.15, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {artifactId === "galileo-telescope" && (
        <group ref={meshRef} rotation={[0.2, 0, -0.3]}>
          <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.22, 0.28, 2.8, 32]} />
            <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[1.0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[1.07, 1.57, 0]} rotation={[0, 0, Math.PI / 4]}>
            <circleGeometry args={[0.26, 32]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {artifactId === "ly-dynasty-celadon" && (
        <group ref={meshRef}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial color="#10b981" roughness={0.15} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.3, 32]} />
            <meshStandardMaterial color="#34d399" roughness={0.15} />
          </mesh>
          <mesh position={[1.1, 0.3, 0]} rotation={[0, 0, -Math.PI / 3]}>
            <cylinderGeometry args={[0.12, 0.25, 0.9, 16]} />
            <meshStandardMaterial color="#10b981" roughness={0.15} />
          </mesh>
        </group>
      )}

      {artifactId === "hcm-rubber-sandals" && (
        <group ref={meshRef} rotation={[Math.PI / 4, 0, 0]}>
          {/* Rubber Sole */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.2, 2.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Rubber Straps */}
          <mesh position={[0, 0.3, 0.2]} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.6, 0.08, 16, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.3, -0.4]} rotation={[-Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.55, 0.08, 16, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
        </group>
      )}

      {artifactId === "ship-model-1911" && (
        <group ref={meshRef}>
          {/* Hull */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.8, 3.2]} />
            <meshStandardMaterial color="#1e1b18" roughness={0.4} />
          </mesh>
          {/* Deck & Superstructure */}
          <mesh position={[0, 0.6, -0.2]}>
            <boxGeometry args={[0.9, 0.6, 1.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Funnel / Smokestack */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Default Golden Artifact */}
      {!["dong-son-drum", "historical-mic-1945", "galileo-telescope", "ly-dynasty-celadon", "hcm-rubber-sandals", "ship-model-1911"].includes(artifactId) && (
        <group ref={meshRef}>
          <mesh>
            <octahedronGeometry args={[1.4, 0]} />
            <meshStandardMaterial
              color="#f59e0b"
              metalness={0.8}
              roughness={0.2}
              emissive="#b45309"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[2.0, 0.06, 16, 64]} />
            <meshStandardMaterial color="#fde68a" metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Artifact3DInspector({ artifactId }: Artifact3DInspectorProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [spotlightOn, setSpotlightOn] = useState<boolean>(true);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(1.8, prev + delta)));
  };

  const handlePlayArtifactSound = () => {
    spaceAudio.playWarpSound();
  };

  return (
    <div className="space-y-3">
      {/* 3D Canvas Box */}
      <div className="w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-black border border-amber-500/30 overflow-hidden relative shadow-inner">
        <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
          <ambientLight intensity={spotlightOn ? 0.9 : 0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={spotlightOn ? 2.0 : 0.8}
            color="#fffbeb"
          />
          <pointLight position={[-4, -3, -2]} intensity={1.0} color="#fbbf24" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
            <ArtifactMesh artifactId={artifactId} zoomLevel={zoomLevel} />
          </Float>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(Math.PI / 4) * 3}
          />
        </Canvas>

        {/* Floating 3D Interaction Control Toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-md text-xs"
            title="Phóng to 3D"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-md text-xs"
            title="Thu nhỏ 3D"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => setSpotlightOn((prev) => !prev)}
            className={`p-1.5 rounded-xl border shadow-md text-xs transition ${
              spotlightOn
                ? "bg-amber-500 text-stone-950 border-amber-400"
                : "bg-stone-900/85 text-stone-400 border-stone-700"
            }`}
            title="Bật/Tắt Ánh Sáng Rực Rỡ"
          >
            <Sun size={15} />
          </button>
        </div>

        {/* Tip */}
        <div className="absolute bottom-2 left-3 px-2.5 py-0.5 rounded-full bg-stone-950/80 text-[10px] text-amber-300 font-mono border border-amber-500/30 pointer-events-none">
          Kéo chuột/chạm để xoay 360° • Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Interactive Mini-Quiz 1-Tap Feature */}
      <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            Câu đố thử tài nhanh về hiện vật:
          </span>
          {quizAnswered !== null && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-fade-in">
              <Award size={11} /> +1 Sao Học Tập ⭐
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              setQuizAnswered(1);
              spaceAudio.playWarpSound();
            }}
            className={`p-2 rounded-xl text-left border transition ${
              quizAnswered === 1
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400 font-bold"
                : "bg-stone-900/80 text-stone-300 border-stone-700 hover:bg-stone-800"
            }`}
          >
            A) Cổ vật có niên đại lịch sử quý hiếm
          </button>
          <button
            onClick={() => {
              setQuizAnswered(2);
              spaceAudio.playWarpSound();
            }}
            className={`p-2 rounded-xl text-left border transition ${
              quizAnswered === 2
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400 font-bold"
                : "bg-stone-900/80 text-stone-300 border-stone-700 hover:bg-stone-800"
            }`}
          >
            B) Biểu tượng văn hóa dân tộc Việt Nam
          </button>
        </div>
      </div>
    </div>
  );
}

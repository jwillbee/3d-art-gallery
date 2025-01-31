import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

function GalleryRoom() {
  return (
    <group>
      {/* 🟦 Floor (Adjusted Walls to Remove Gap) */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* 🟩 Left Wall (Lowered by 0.05) */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🟩 Right Wall (Lowered by 0.05) */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🟦 Back Wall (Lowered by 0.05) */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🎨 Art Frames on Left Wall (Rotated to Face Inward) */}
      <ArtFrame position={[-4.9, 2, -2]} rotation={[0, Math.PI / 2, 0]} />
      <ArtFrame position={[-4.9, 2, 2]} rotation={[0, Math.PI / 2, 0]} />

      {/* 🎨 Art Frames on Right Wall (Rotated to Face Inward) */}
      <ArtFrame position={[4.9, 2, -2]} rotation={[0, -Math.PI / 2, 0]} />
      <ArtFrame position={[4.9, 2, 2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 🎨 Art Frames on Back Wall (No Rotation Needed) */}
      <ArtFrame position={[0, 2, -4.9]} />
      <ArtFrame position={[2, 2, -4.9]} />
      <ArtFrame position={[-2, 2, -4.9]} />

      {/* 🔆 Lighting */}
      <pointLight position={[0, 3, 0]} intensity={2} castShadow />
    </group>
  );
}

export default function Gallery() {
  return (
    <Canvas camera={{ position: [0, 2, 6] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />
      <GalleryRoom />
      <OrbitControls />
    </Canvas>
  );
}

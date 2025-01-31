import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function DebugBox() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
function ArtFrame({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

function GalleryRoom() {
  return (
    <group>
      {/* 🟦 Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* 🟩 Left Wall */}
      <mesh position={[-5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🟩 Right Wall */}
      <mesh position={[5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🟦 Back Wall */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* 🔆 Better Lighting */}
      <pointLight position={[0, 3, 0]} intensity={2} castShadow />
    </group>
  );
}

export default function Gallery() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} castShadow />
      
      <DebugBox /> {/* 🔴 Red test box should appear */}

      <GalleryRoom />
      <OrbitControls />
    </Canvas>
  );
}

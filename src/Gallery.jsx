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

function GalleryRoom() {
  return (
    <group>
      {/* Gallery walls, floor, ceiling (if applicable) */}
      {/* Art frames go here */}
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

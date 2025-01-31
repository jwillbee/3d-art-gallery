import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Gallery() {
  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      {/* Add light source */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />

      {/* A simple cube */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* OrbitControls for camera movement */}
      <OrbitControls />
    </Canvas>
  );
}

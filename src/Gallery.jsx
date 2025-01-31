import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// ArtFrame component for displaying the art
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

// Room component with walls, floor, and artframes
function Room({ position }) {
  return (
    <group position={position}>
      {/* 🟦 Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
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

      {/* 🎨 Art Frames */}
      <ArtFrame position={[-4.9, 2, -2]} rotation={[0, Math.PI / 2, 0]} />
      <ArtFrame position={[4.9, 2, -2]} rotation={[0, -Math.PI / 2, 0]} />
      <ArtFrame position={[0, 2, -4.9]} />
    </group>
  );
}

export default function Gallery() {
  // Room offset values to create the hallway effect
  const roomDistance = -10; // Negative to move rooms along the Z-axis
  const rooms = [
    { position: [0, 0, 0] },   // Main Room
    { position: [0, 0, roomDistance] },   // Room 2
    { position: [0, 0, roomDistance * 2] }, // Room 3
    { position: [0, 0, roomDistance * 3] }, // Room 4
  ];

  return (
    <Canvas camera={{ position: [0, 3, 25], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />

      {/* Render all rooms */}
      {rooms.map((room, index) => (
        <Room key={index} position={room.position} />
      ))}

      {/* OrbitControls for camera movement */}
      <OrbitControls />
    </Canvas>
  );
}

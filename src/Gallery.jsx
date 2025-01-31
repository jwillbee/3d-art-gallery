import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function DebugBox() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
// Gallery Room Component
function GalleryRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1, -5]}>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1, 5]}>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-5, 1, 0]}>
        <boxGeometry args={[0.1, 3, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[5, 1, 0]}>
        <boxGeometry args={[0.1, 3, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Art Frames (You can replace these with images) */}
      <ArtFrame position={[-2, 1, -4.9]} imageUrl={"/art/art1.jpg"} />
      <ArtFrame position={[2, 1, -4.9]} imageUrl={"/art/art2.jpg"} />
      <ArtFrame position={[-2, 1, 4.9]} imageUrl={"/art/art3.jpg"} />
      <ArtFrame position={[2, 1, 4.9]} imageUrl={"/art/art4.jpg"} />
    </group>
  );
}

// Art Frame Component
function ArtFrame({ position, imageUrl }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={useTexture(imageUrl)} />
    </mesh>
  );
}

// Load textures for images
import { useTexture } from "@react-three/drei";

// Gallery Component
export default function Gallery() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} castShadow />
        <GalleryRoom />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}

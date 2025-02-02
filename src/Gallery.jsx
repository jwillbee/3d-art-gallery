import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, Shape } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

// Wall component with optional centered vertical opening
function Wall({ position, rotation, hasOpening = false }) {
  if (!hasOpening) {
    return (
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
  } else {
    // Create a wall with a centered vertical opening using Shape
    const wallShape = new Shape();
    wallShape.moveTo(-5, 0);
    wallShape.lineTo(-5, 5);
    wallShape.lineTo(5, 5);
    wallShape.lineTo(5, 0);
    wallShape.lineTo(-5, 0);

    const openingWidth = 4; // Width of the opening
    const openingHeight = 3; // Height of the opening
    const openingShape = new Shape();
    openingShape.moveTo(-openingWidth / 2, 1); // Bottom left corner of the opening
    openingShape.lineTo(-openingWidth / 2, 1 + openingHeight);
    openingShape.lineTo(openingWidth / 2, 1 + openingHeight);
    openingShape.lineTo(openingWidth / 2, 1);
    openingShape.lineTo(-openingWidth / 2, 1);

    wallShape.holes.push(openingShape);

    const geometry = new THREE.ShapeGeometry(wallShape);

    return (
      <mesh position={position} rotation={rotation}>
        <bufferGeometry attach="geometry" {...geometry} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
  }
}

// ArtFrame component for displaying the art
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

// InfoSign component placed directly in front of the start point
function InfoSign({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[4, 2, 0.1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

// Ceiling component
function Ceiling({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// Room component
function Room({ position, openings = {} }) {
  return (
    <group position={position}>
      {/* Floor */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.1, 30]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>

      {/* Walls */}
      {/* Left Wall */}
      <Wall
        position={[-5, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        hasOpening={openings.left}
      />
      {/* Right Wall */}
      <Wall
        position={[5, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        hasOpening={openings.right}
      />
      {/* Back Wall */}
      <Wall
        position={[0, 2.5, -15]}
        rotation={[0, 0, 0]}
        hasOpening={openings.back}
      />
      {/* Front Wall */}
      <Wall
        position={[0, 2.5, 15]}
        rotation={[0, Math.PI, 0]}
        hasOpening={openings.front}
      />

      {/* Ceiling */}
      <Ceiling position={[0, 5, 0]} size={[10, 0.1, 30]} />

      {/* Art Frames attached to walls */}
      {!openings.front && (
        <ArtFrame position={[0, 2, 14.9]} rotation={[0, Math.PI, 0]} />
      )}
      {!openings.back && (
        <ArtFrame position={[0, 2, -14.9]} rotation={[0, 0, 0]} />
      )}
      {!openings.left && (
        <>
          <ArtFrame position={[-4.9, 2, -10]} rotation={[0, Math.PI / 2, 0]} />
          <ArtFrame position={[-4.9, 2, 0]} rotation={[0, Math.PI / 2, 0]} />
          <ArtFrame position={[-4.9, 2, 10]} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}
      {!openings.right && (
        <>
          <ArtFrame position={[4.9, 2, -10]} rotation={[0, -Math.PI / 2, 0]} />
          <ArtFrame position={[4.9, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <ArtFrame position={[4.9, 2, 10]} rotation={[0, -Math.PI / 2, 0]} />
        </>
      )}
    </group>
  );
}

// Camera Controller Component with Collision Detection
function CameraController() {
  // ... (Existing CameraController code remains unchanged)
}

// Main Gallery component
export default function GalleryApp() {
  const cameraStartPosition = [0, 2, 50]; // Start at one end of the hallway

  return (
    <Canvas camera={{ position: cameraStartPosition, fov: 75 }}>
      {/* Camera Controller */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />

      {/* Main Hall */}
      <group position={[0, 0, 0]}>
        {/* Floor */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.1, 100]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>

        {/* Walls */}
        {/* Left Wall with openings to side rooms */}
        <Wall
          position={[-5, 2.5, 20]}
          rotation={[0, Math.PI / 2, 0]}
          hasOpening={true}
        />
        <Wall
          position={[-5, 2.5, -20]}
          rotation={[0, Math.PI / 2, 0]}
          hasOpening={true}
        />
        {/* Left Wall segments */}
        <Wall
          position={[-5, 2.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* Right Wall with openings to side rooms */}
        <Wall
          position={[5, 2.5, 20]}
          rotation={[0, -Math.PI / 2, 0]}
          hasOpening={true}
        />
        <Wall
          position={[5, 2.5, -20]}
          rotation={[0, -Math.PI / 2, 0]}
          hasOpening={true}
        />
        {/* Right Wall segments */}
        <Wall
          position={[5, 2.5, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />

        {/* Back Wall */}
        <Wall position={[0, 2.5, 50]} rotation={[0, Math.PI, 0]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, -50]} />

        {/* Ceiling */}
        <Ceiling position={[0, 5, 0]} size={[10, 0.1, 100]} />

        {/* Art Frames attached to walls */}
        {[-40, -20, 0, 20, 40].map((zPos) => (
          <ArtFrame
            key={`left-frame-${zPos}`}
            position={[-4.9, 2, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}

        {/* Info Sign directly in front of the start point */}
        <InfoSign position={[0, 2.5, 49.9]} rotation={[0, Math.PI, 0]} />

        {/* Placeholder for other gallery decorations */}
        <mesh position={[0, 0.6, 47]}>
          <boxGeometry args={[1, 1.2, 1]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </group>

      {/* Left Rooms */}
      {/* Left Room 1 */}
      <Room
        position={[-10, 0, 20]}
        openings={{ right: true }}
      />
      {/* Left Room 2 */}
      <Room
        position={[-10, 0, -20]}
        openings={{ right: true }}
      />

      {/* Right Rooms */}
      {/* Right Room 1 */}
      <Room
        position={[10, 0, 20]}
        openings={{ left: true }}
      />
      {/* Right Room 2 */}
      <Room
        position={[10, 0, -20]}
        openings={{ left: true }}
      />
    </Canvas>
  );
}

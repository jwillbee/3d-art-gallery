// Ensure all necessary imports are included
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

// Wall component
function Wall({ position, rotation, size }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// WallWithOpenings component to create a wall with multiple doorways
function WallWithOpenings({ position, rotation, size, openings }) {
  const [width, height, depth] = size;

  // Create the wall shape
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-width / 2, -height / 2);
  wallShape.lineTo(-width / 2, height / 2);
  wallShape.lineTo(width / 2, height / 2);
  wallShape.lineTo(width / 2, -height / 2);
  wallShape.lineTo(-width / 2, -height / 2);

  // Create openings in the wall
  openings.forEach((opening) => {
    const { x, y, openingWidth, openingHeight } = opening;
    const hole = new THREE.Path();
    hole.moveTo(x - openingWidth / 2, y - openingHeight / 2);
    hole.lineTo(x - openingWidth / 2, y + openingHeight / 2);
    hole.lineTo(x + openingWidth / 2, y + openingHeight / 2);
    hole.lineTo(x + openingWidth / 2, y - openingHeight / 2);
    hole.lineTo(x - openingWidth / 2, y - openingHeight / 2);
    wallShape.holes.push(hole);
  });

  const geometry = new THREE.ShapeGeometry(wallShape);

  return (
    <mesh position={position} rotation={rotation}>
      <primitive object={geometry} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// ArtFrame component
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
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

// Floor component
function Floor({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}

// Camera Controller with Collision Detection (unchanged)
function CameraController() {
  const { camera } = useThree();
  const touchData = useRef({ startX: 0, startY: 0, isTwoFinger: false });
  const speed = 0.5;
  const threshold = 20;

  const boundaries = [
    // Main Hall
    { xMin: -5, xMax: 5, zMin: 0, zMax: 75 },
    // Side Room 1
    { xMin: 5, xMax: 15, zMin: 30, zMax: 45 },
    // Side Room 2
    { xMin: 5, xMax: 15, zMin: 47.5, zMax: 62.5 },
  ];

  const [{ position, rotationY }, api] = useSpring(() => ({
    position: camera.position.toArray(),
    rotationY: camera.rotation.y,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  useFrame(() => {
    camera.position.set(...position.get());
    camera.rotation.set(0, rotationY.get(), 0);
  });

  useEffect(() => {
    const handleTouchStart = (e) => {
      e.preventDefault();
      touchData.current.isTwoFinger = e.touches.length === 2;
      touchData.current.startX = e.touches[0].clientX;
      touchData.current.startY = e.touches[0].clientY;

      if (touchData.current.isTwoFinger && e.touches.length === 2) {
        touchData.current.startX2 = e.touches[1].clientX;
        touchData.current.startY2 = e.touches[1].clientY;
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      if (touchData.current.isTwoFinger && e.touches.length === 2) {
        // Rotation
        const deltaX =
          (currentX + e.touches[1].clientX) / 2 -
          (touchData.current.startX + touchData.current.startX2) / 2;

        const newRotationY = rotationY.get() - deltaX * 0.005;

        api.start({ rotationY: newRotationY });

        touchData.current.startX = e.touches[0].clientX;
        touchData.current.startX2 = e.touches[1].clientX;
      } else if (!touchData.current.isTwoFinger) {
        // Movement
        const deltaX = currentX - touchData.current.startX;
        const deltaY = currentY - touchData.current.startY;

        if (Math.hypot(deltaX, deltaY) < threshold) return;

        const currentPosition = position.get();
        let newPosition = [...currentPosition];
        const forward = new Vector3();
        camera.getWorldDirection(forward);

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Forward/backward
          if (deltaY < 0) {
            newPosition[0] += forward.x * speed;
            newPosition[2] += forward.z * speed;
          } else {
            newPosition[0] -= forward.x * speed;
            newPosition[2] -= forward.z * speed;
          }
        } else {
          // Left/right
          const sideways = new Vector3();
          sideways.crossVectors(camera.up, forward).normalize();

          if (deltaX < 0) {
            newPosition[0] -= sideways.x * speed;
            newPosition[2] -= sideways.z * speed;
          } else {
            newPosition[0] += sideways.x * speed;
            newPosition[2] += sideways.z * speed;
          }
        }

        if (isWithinBoundaries(newPosition)) {
          api.start({ position: newPosition });
        }

        touchData.current.startX = currentX;
        touchData.current.startY = currentY;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      touchData.current.isTwoFinger = false;
    };

    const isWithinBoundaries = (pos) => {
      for (const boundary of boundaries) {
        if (
          pos[0] >= boundary.xMin &&
          pos[0] <= boundary.xMax &&
          pos[2] >= boundary.zMin &&
          pos[2] <= boundary.zMax
        ) {
          return true;
        }
      }
      return false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [api, boundaries, camera, position, rotationY]);

  return null;
}

// Main Gallery component with adjustments
export default function GalleryApp() {
  const cameraStartPosition = [0, 2, 70];

  return (
    <Canvas camera={{ position: cameraStartPosition, fov: 75 }}>
      <CameraController />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 37.5]} intensity={1} />

      {/* Main Hall */}
      <group position={[0, 0, 0]}>
        {/* Floor */}
        <Floor position={[0, 0, 37.5]} size={[10, 0.1, 75]} />
        {/* Ceiling */}
        <Ceiling position={[0, 5, 37.5]} size={[10, 0.1, 75]} />
        {/* Walls */}
        {/* Back Wall */}
        <Wall position={[0, 2.5, 0]} rotation={[0, 0, 0]} size={[10, 5, 0.1]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, 75]} rotation={[0, Math.PI, 0]} size={[10, 5, 0.1]} />
        {/* Left Wall */}
        <Wall position={[-5, 2.5, 37.5]} rotation={[0, Math.PI / 2, 0]} size={[75, 5, 0.1]} />
        {/* Right Wall with Openings for Side Rooms */}
        <WallWithOpenings
          position={[5, 2.5, 37.5]}
          rotation={[0, -Math.PI / 2, 0]}
          size={[75, 5, 0.1]}
          openings={[
            // Opening for Side Room 1 (z = 30 to z = 45)
            { x: 30 - 37.5, y: 0, openingWidth: 0.1, openingHeight: 3 },
            // Opening for Side Room 2 (z = 47.5 to z = 62.5)
            { x: 55 - 37.5, y: 0, openingWidth: 0.1, openingHeight: 3 },
          ]}
        />
        {/* ArtFrames */}
        {/* Left Wall */}
        {[10, 25, 40, 55, 70].map((zPos) => (
          <ArtFrame
            key={`left-frame-${zPos}`}
            position={[-4.9, 2, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}
        {/* Right Wall */}
        {[10, 65].map((zPos) => (
          <ArtFrame
            key={`right-frame-${zPos}`}
            position={[4.9, 2, zPos]}
            rotation={[0, -Math.PI / 2, 0]}
          />
        ))}
      </group>

      {/* Side Room 1 on the Right */}
      <group position={[10, 0, 37.5]}>
        {/* Floor */}
        <Floor position={[0, 0, -7.5]} size={[10, 0.1, 15]} />
        {/* Ceiling */}
        <Ceiling position={[0, 5, -7.5]} size={[10, 0.1, 15]} />
        {/* Walls */}
        {/* Back Wall */}
        <Wall position={[0, 2.5, -15]} rotation={[0, 0, 0]} size={[10, 5, 0.1]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, 0]} rotation={[0, Math.PI, 0]} size={[10, 5, 0.1]} />
        {/* Right Wall */}
        <Wall position={[5, 2.5, -7.5]} rotation={[0, -Math.PI / 2, 0]} size={[15, 5, 0.1]} />
        {/* ArtFrames */}
        {/* Back Wall */}
        <ArtFrame position={[0, 2, -14.9]} rotation={[0, 0, 0]} />
        {/* Front Wall */}
        <ArtFrame position={[0, 2, -0.1]} rotation={[0, Math.PI, 0]} />
        {/* Right Wall */}
        <ArtFrame position={[4.9, 2, -12.5]} rotation={[0, -Math.PI / 2, 0]} />
        <ArtFrame position={[4.9, 2, -7.5]} rotation={[0, -Math.PI / 2, 0]} />
        <ArtFrame position={[4.9, 2, -2.5]} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      {/* Side Room 2 on the Right */}
      <group position={[10, 0, 55]}>
        {/* Floor */}
        <Floor position={[0, 0, 0]} size={[10, 0.1, 15]} />
        {/* Ceiling */}
        <Ceiling position={[0, 5, 0]} size={[10, 0.1, 15]} />
        {/* Walls */}
        {/* Back Wall */}
        <Wall position={[0, 2.5, -7.5]} rotation={[0, 0, 0]} size={[10, 5, 0.1]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, 7.5]} rotation={[0, Math.PI, 0]} size={[10, 5, 0.1]} />
        {/* Right Wall */}
        <Wall position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} size={[15, 5, 0.1]} />
        {/* ArtFrames */}
        {/* Back Wall */}
        <ArtFrame position={[0, 2, -7.4]} rotation={[0, 0, 0]} />
        {/* Front Wall */}
        <ArtFrame position={[0, 2, 7.4]} rotation={[0, Math.PI, 0]} />
        {/* Right Wall */}
        <ArtFrame position={[4.9, 2, -5]} rotation={[0, -Math.PI / 2, 0]} />
        <ArtFrame position={[4.9, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <ArtFrame position={[4.9, 2, 5]} rotation={[0, -Math.PI / 2, 0]} />
      </group>
    </Canvas>
  );
}

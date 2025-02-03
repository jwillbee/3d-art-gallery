import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useSpring } from '@react-spring/three';

// Wall component
function Wall({ position, rotation, width = 10, height = 5 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, height, 0.1]} />
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

// Room component
function Room({ position }) {
  return (
    <group position={position}>
      {/* Floor */}
      <Floor position={[0, 0, 0]} size={[10, 0.1, 20]} />

      {/* Ceiling */}
      <Ceiling position={[0, 5, 0]} size={[10, 0.1, 20]} />

      {/* Walls */}
      {/* Back Wall */}
      <Wall position={[0, 2.5, -10]} rotation={[0, 0, 0]} />
      {/* Front Wall */}
      <Wall position={[0, 2.5, 10]} rotation={[0, Math.PI, 0]} />
      {/* Right Wall */}
      <Wall position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Exterior Left Wall */}
      <Wall position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Art Frames */}
      {/* Back Wall */}
      <ArtFrame position={[0, 2, -9.9]} rotation={[0, 0, 0]} />
      {/* Right Wall */}
      <ArtFrame position={[4.9, 2, -5]} rotation={[0, -Math.PI / 2, 0]} />
      <ArtFrame position={[4.9, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <ArtFrame position={[4.9, 2, 5]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Front Wall */}
      <ArtFrame position={[0, 2, 9.9]} rotation={[0, Math.PI, 0]} />
      {/* No art frames on the open side (connected to the main hall) */}
    </group>
  );
}

// Camera Controller with Collision Detection
function CameraController() {
  const { camera } = useThree();
  const touchData = useRef({ startX: 0, startY: 0, isTwoFinger: false });
  const speed = 0.5;
  const threshold = 20;

  const boundaries = [
    // Main Hall
    { xMin: -5, xMax: 5, zMin: 0, zMax: 100 },
    // Rooms on the Right Side
    { xMin: 5, xMax: 15, zMin: 30, zMax: 50 }, // Room 1
    { xMin: 5, xMax: 15, zMin: 60, zMax: 80 }, // Room 2
  ];

  const [{ position, rotationY }, api] = useSpring(() => ({
    position: camera.position.toArray(),
    rotationY: camera.rotation.y,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  useFrame(() => {
    camera.position.lerp(new Vector3(...position.get()), 0.1);
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

        let newRotationY = rotationY.get() - deltaX * 0.005;

        api.start({ rotationY: newRotationY });

        touchData.current.startX = e.touches[0].clientX;
        touchData.current.startX2 = e.touches[1].clientX;
      } else if (!touchData.current.isTwoFinger) {
        // Movement
        const deltaX = currentX - touchData.current.startX;
        const deltaY = currentY - touchData.current.startY;

        if (Math.hypot(deltaX, deltaY) < threshold) return;

        let newPosition = [...position.get()];
        const forward = new Vector3();
        camera.getWorldDirection(forward);

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY < 0) {
            newPosition[0] += forward.x * speed;
            newPosition[2] += forward.z * speed;
          } else {
            newPosition[0] -= forward.x * speed;
            newPosition[2] -= forward.z * speed;
          }
        } else {
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

// Main Gallery component
export default function GalleryApp() {
  const cameraStartPosition = [0, 2, 90];

  return (
    <Canvas camera={{ position: cameraStartPosition, fov: 75 }}>
      <CameraController />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 50]} intensity={1} />

      {/* Main Hall */}
      <group position={[0, 0, 0]}>
        {/* Floor */}
        <Floor position={[0, 0, 50]} size={[10, 0.1, 100]} />

        {/* Ceiling */}
        <Ceiling position={[0, 5, 50]} size={[10, 0.1, 100]} />

        {/* Walls */}
        {/* Back Wall */}
        <Wall position={[0, 2.5, 0]} rotation={[0, Math.PI, 0]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, 100]} rotation={[0, 0, 0]} />
        {/* Left Wall */}
        <Wall position={[-5, 2.5, 50]} rotation={[0, Math.PI / 2, 0]} />
        {/* Right Wall with Openings for Rooms */}
        {/* Upper Part */}
        <Wall position={[5, 2.5, 85]} rotation={[0, -Math.PI / 2, 0]} width={30} />
        {/* Lower Part */}
        <Wall position={[5, 2.5, 15]} rotation={[0, -Math.PI / 2, 0]} width={30} />

        {/* Art Frames on Walls */}
        {/* Left Wall */}
        {[10, 30, 50, 70, 90].map((zPos) => (
          <ArtFrame
            key={`left-frame-${zPos}`}
            position={[-4.9, 2, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}
        {/* Right Wall */}
        {[10, 30, 70, 90].map((zPos) => (
          <ArtFrame
            key={`right-frame-${zPos}`}
            position={[4.9, 2, zPos]}
            rotation={[0, -Math.PI / 2, 0]}
          />
        ))}
      </group>

      {/* Rooms on the Right Side */}
      <Room position={[10, 0, 40]} />
      <Room position={[10, 0, 70]} />
    </Canvas>
  );
}

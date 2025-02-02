import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

// ArtFrame component for displaying the art
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1.5, 0.1]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// Information Sign component
function InfoSign({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[4, 2, 0.1]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

// Wall component
function Wall({ position, rotation, hasOpening = false }) {
  if (hasOpening) {
    return (
      <group position={position} rotation={rotation}>
        {/* Left segment of the wall */}
        <mesh position={[-2.5, 2.5, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Right segment of the wall */}
        <mesh position={[2.5, 2.5, 0]}>
          <boxGeometry args={[5, 5, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    );
  } else {
    return (
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    );
  }
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
        <boxGeometry args={[10, 0.1, 10]} />
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
        position={[0, 2.5, -5]}
        rotation={[0, 0, 0]}
        hasOpening={openings.back}
      />
      {/* Front Wall */}
      <Wall
        position={[0, 2.5, 5]}
        rotation={[0, Math.PI, 0]}
        hasOpening={openings.front}
      />

      {/* Ceiling */}
      <Ceiling position={[0, 5, 0]} size={[10, 0.1, 10]} />

      {/* Art Frames attached to visible walls */}
      {/* Left Wall Art Frames */}
      {!openings.left && (
        <>
          <ArtFrame position={[-4.9, 2.5, -3]} rotation={[0, Math.PI / 2, 0]} />
          <ArtFrame position={[-4.9, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />
          <ArtFrame position={[-4.9, 2.5, 3]} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}
      {/* Back Wall Art Frames */}
      {!openings.back && (
        <>
          <ArtFrame position={[0, 2.5, -4.9]} rotation={[0, 0, 0]} />
        </>
      )}
      {/* Right Wall Art Frames */}
      {!openings.right && (
        <>
          <ArtFrame position={[4.9, 2.5, -3]} rotation={[0, -Math.PI / 2, 0]} />
          <ArtFrame position={[4.9, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <ArtFrame position={[4.9, 2.5, 3]} rotation={[0, -Math.PI / 2, 0]} />
        </>
      )}
    </group>
  );
}

// Camera Controller Component with Collision Detection
function CameraController() {
  const { camera } = useThree();
  const touchData = useRef({ startX: 0, startY: 0, isTwoFinger: false });
  const speed = 0.5;
  const threshold = 20;

  // Define the walkable boundaries
  const boundaries = [
    { xMin: -5, xMax: 5, zMin: -25, zMax: 25 }, // Main Hall
    // Left Rooms
    { xMin: -15, xMax: -5, zMin: -15, zMax: -5 }, // Left Room 1
    { xMin: -15, xMax: -5, zMin: 5, zMax: 15 },   // Left Room 2
    // Right Rooms
    { xMin: 5, xMax: 15, zMin: -15, zMax: -5 },   // Right Room 1
    { xMin: 5, xMax: 15, zMin: 5, zMax: 15 },     // Right Room 2
  ];

  // Initialize spring values
  const [{ position, rotationY }, api] = useSpring(() => ({
    position: camera.position.toArray(),
    rotationY: camera.rotation.y,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  // Update camera position and rotation on each frame
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
        // Two-finger rotation
        const deltaX =
          (currentX + e.touches[1].clientX) / 2 -
          (touchData.current.startX + touchData.current.startX2) / 2;

        let newRotationY = rotationY.get() - deltaX * 0.005;

        // Update rotation
        api.start({ rotationY: newRotationY });

        // Update start positions for continuous rotation
        touchData.current.startX = e.touches[0].clientX;
        touchData.current.startX2 = e.touches[1].clientX;
      } else if (!touchData.current.isTwoFinger) {
        // Single-finger movement
        const deltaX = currentX - touchData.current.startX;
        const deltaY = currentY - touchData.current.startY;

        if (Math.hypot(deltaX, deltaY) < threshold) return;

        let newPosition = [...position.get()];
        const forward = new Vector3();
        camera.getWorldDirection(forward);

        // Move forward/backward
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY < 0) {
            // Swipe up - move forward
            newPosition[0] += forward.x * speed;
            newPosition[2] += forward.z * speed;
          } else {
            // Swipe down - move backward
            newPosition[0] -= forward.x * speed;
            newPosition[2] -= forward.z * speed;
          }
        } else {
          // Strafe left/right
          const sideways = new Vector3();
          sideways.crossVectors(camera.up, forward).normalize();

          if (deltaX < 0) {
            // Swipe left - strafe left
            newPosition[0] -= sideways.x * speed;
            newPosition[2] -= sideways.z * speed;
          } else {
            // Swipe right - strafe right
            newPosition[0] += sideways.x * speed;
            newPosition[2] += sideways.z * speed;
          }
        }

        // Collision detection: Check if newPosition is within boundaries
        if (isWithinBoundaries(newPosition)) {
          // Update position
          api.start({ position: newPosition });
        }

        // Update start positions for continuous movement
        touchData.current.startX = currentX;
        touchData.current.startY = currentY;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      touchData.current.isTwoFinger = false;
    };

    // Collision detection function
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

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [api, position, rotationY, speed, threshold]);

  return null;
}

// Main Gallery component
export default function GalleryApp() {
  const cameraStartPosition = [0, 2, 25]; // Start at one end of the hallway
  const cameraStartRotation = [0, Math.PI, 0]; // Facing down the hallway along negative Z-axis

  return (
    <Canvas camera={{ position: cameraStartPosition, rotation: cameraStartRotation, fov: 75 }}>
      {/* Camera Controller */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />

      {/* Main Hall */}
      <group position={[0, 0, 0]}>
        {/* Floor */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.1, 50]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>

        {/* Left Wall */}
        <Wall position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />
        {/* Right Wall */}
        <Wall position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
        {/* Back Wall */}
        <Wall position={[0, 2.5, 25]} rotation={[0, Math.PI, 0]} />
        {/* Front Wall */}
        <Wall position={[0, 2.5, -25]} />

        {/* Openings to side rooms */}
        {/* Left Rooms Openings */}
        <Wall
          position={[-5, 2.5, 15]}
          rotation={[0, -Math.PI / 2, 0]}
          hasOpening
        />
        <Wall
          position={[-5, 2.5, -15]}
          rotation={[0, -Math.PI / 2, 0]}
          hasOpening
        />

        {/* Right Rooms Openings */}
        <Wall
          position={[5, 2.5, 15]}
          rotation={[0, Math.PI / 2, 0]}
          hasOpening
        />
        <Wall
          position={[5, 2.5, -15]}
          rotation={[0, Math.PI / 2, 0]}
          hasOpening
        />

        {/* Ceiling */}
        <Ceiling position={[0, 5, 0]} size={[10, 0.1, 50]} />

        {/* Art Frames attached to visible walls */}
        {[-20, -10, 0, 10, 20].map((zPos) => (
          <ArtFrame
            key={`left-frame-${zPos}`}
            position={[-4.9, 2.5, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}

        {/* Info Sign directly in front of the start point */}
        <InfoSign position={[0, 2.5, 24.9]} rotation={[0, Math.PI, 0]} />

        {/* Placeholder for other gallery items */}
        <mesh position={[0, 0.6, 22]}>
          <boxGeometry args={[1, 1.2, 1]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </group>

      {/* Left Rooms */}
      {/* Left Room 1 */}
      <Room
        position={[-10, 0, 15]}
        openings={{ right: true }}
      />
      {/* Left Room 2 */}
      <Room
        position={[-10, 0, -15]}
        openings={{ right: true }}
      />

      {/* Right Rooms */}
      {/* Right Room 1 */}
      <Room
        position={[10, 0, 15]}
        openings={{ left: true }}
      />
      {/* Right Room 2 */}
      <Room
        position={[10, 0, -15]}
        openings={{ left: true }}
      />
    </Canvas>
  );
}

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

// ArtFrame component
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color='black' />
    </mesh>
  );
}

// Room component
function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color='gray' />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color='white' />
      </mesh>
      {/* Right Wall */}
      <mesh position={[5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color='white' />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 2, -5]}>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshStandardMaterial color='white' />
      </mesh>
      {/* Art Frames */}
      <ArtFrame position={[-4.9, 2, -2]} rotation={[0, Math.PI / 2, 0]} />
      <ArtFrame position={[4.9, 2, -2]} rotation={[0, -Math.PI / 2, 0]} />
      <ArtFrame position={[0, 2, -4.9]} />
    </group>
  );
}

// Doorway component
function Doorway({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 3, 0.1]} />
      <meshStandardMaterial color='brown' />
    </mesh>
  );
}

// CameraController component
function CameraController() {
  const { camera } = useThree();
  const touchData = useRef({ startX: 0, startY: 0, isTwoFinger: false });
  const speed = 1; // Adjust the speed as needed
  const threshold = 20; // Minimum swipe distance to detect
  const rotationSpeed = MathUtils.degToRad(1); // Rotation speed per move

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
      
      if (touchData.current.isTwoFinger) {
        // For two-finger rotation, store initial positions
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
        const deltaX = ((currentX + e.touches[1].clientX) / 2) - ((touchData.current.startX + touchData.current.startX2) / 2);

        if (Math.abs(deltaX) > threshold) {
          let newRotationY = rotationY.get() - deltaX * 0.005;

          // Update rotation
          api.start({ rotationY: newRotationY });
          // Update start positions for continuous rotation
          touchData.current.startX = e.touches[0].clientX;
          touchData.current.startX2 = e.touches[1].clientX;
        }
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

        // Clamp positions
        newPosition[0] = THREE.MathUtils.clamp(newPosition[0], -15, 15);
        newPosition[2] = THREE.MathUtils.clamp(newPosition[2], -30, 10);

        // Update position
        api.start({ position: newPosition });

        // Update start positions for continuous movement
        touchData.current.startX = currentX;
        touchData.current.startY = currentY;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      touchData.current.isTwoFinger = false;
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
export default function Gallery() {
  const rooms = [
    { position: [0, 0, 0] },
    { position: [-10, 0, 0] },
    { position: [10, 0, 0] },
  ];

  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
      {/* Camera Controller */}
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* Rooms */}
      {rooms.map((room, index) => (
        <group key={index} position={room.position}>
          <Room />
          {/* Doorways */}
          {index !== 0 && (
            <Doorway position={[room.position[0] > 0 ? -5 : 5, 1.5, 0]} />
          )}
        </group>
      ))}
    </Canvas>
  );
}

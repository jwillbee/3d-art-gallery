import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

// ArtFrame component
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
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
        <meshStandardMaterial color="gray" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[5, 2, 0]}>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 2, -5]}>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshStandardMaterial color="white" />
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
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}

// CameraController component
function CameraController() {
  const { camera } = useThree();
  const startTouch = useRef({ x: 0, y: 0 });
  const speed = 5; // Adjust the speed as needed
  const threshold = 30; // Minimum swipe distance to detect

  const [, setSpring] = useSpring(
    () => ({
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray(),
      config: { mass: 1, tension: 280, friction: 60 },
    }),
    []
  );

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startTouch.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startTouch.current.x;
      const deltaY = touch.clientY - startTouch.current.y;

      if (Math.hypot(deltaX, deltaY) < threshold) return; // Ignore small swipes

      let newX = camera.position.x;
      let newZ = camera.position.z;
      let newRotationY = camera.rotation.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          // Swipe right - move camera left
          newX -= speed;
          newRotationY = MathUtils.degToRad(90);
        } else {
          // Swipe left - move camera right
          newX += speed;
          newRotationY = MathUtils.degToRad(-90);
        }
      } else {
        if (deltaY > 0) {
          // Swipe down - move camera backward
          newZ += speed;
          newRotationY = MathUtils.degToRad(180);
        } else {
          // Swipe up - move camera forward
          newZ -= speed;
          newRotationY = 0;
        }
      }

      // Clamp positions
      newX = THREE.MathUtils.clamp(newX, -15, 15);
      newZ = THREE.MathUtils.clamp(newZ, -30, 10);

      // Update camera with smooth transition
      setSpring.start({
        to: {
          position: [newX, camera.position.y, newZ],
          rotation: [camera.rotation.x, newRotationY, camera.rotation.z],
        },
        onChange: ({ value: { position, rotation } }) => {
          camera.position.set(...position);
          camera.rotation.set(...rotation);
        },
      });
    };

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, setSpring]);

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

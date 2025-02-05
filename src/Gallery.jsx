import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Texture load
const textureLoader = new TextureLoader();
const floorTexture = textureLoader.load('/textures/laminate_floor_02_diff_4k.jpg', (texture) => {
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(5, 20);
floorTexture.needsUpdate = true;
});
const ceilingTexture = textureLoader.load('/textures/concrete_wall_008_diff_4k.jpg', (texture) => {
  ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(5, 10);
ceilingTexture.needsUpdate = true;
});
const wallTexture = textureLoader.load('/textures/brick_wall_09_diff_4k.jpg', (texture) => {
 wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(2, 3);
wallTexture.needsUpdate = true;;
});

// materials
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});
const ceilingMaterial = new THREE.MeshStandardMaterial({
  map: ceilingTexture,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});
const wallMaterial = new THREE.MeshStandardMaterial({
  map: wallTexture,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});


// Wall component
function Wall({ position, rotation, size }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={wallMaterial.map} />
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
      <meshStandardMaterial map={ceilingMaterial.map} />
    </mesh>
  );
}

// Floor component
function Floor({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={floorMaterial.map} />
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
    // Far Room on the Right
    { xMin: 5, xMax: 15, zMin: 30, zMax: 45 },
    // Near Room on the Right
    { xMin: 5, xMax: 15, zMin: 5, zMax: 20 },
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
      <ambientLight intensity={1} />
      <pointLight position={[0, 5, 37.5]} intensity={2} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, 5]} intensity={1.5} />

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
  {/* Right Wall */}
  {/* Divided into three segments to create two openings for the side rooms */}
  {/* First Segment (from z = 0 to z = 10) */}
  <Wall
    position={[5, 2.5, 5]}
    rotation={[0, -Math.PI / 2, 0]}
    size={[10, 5, 0.1]}
  />
  {/* Second Segment (from z = 10 to z = 30) */}
  <Wall
    position={[5, 2.5, 20]}
    rotation={[0, -Math.PI / 2, 0]}
    size={[20, 5, 0.1]}
  />
  {/* Third Segment (from z = 45 to z = 75) */}
  <Wall
    position={[5, 2.5, 60]}
    rotation={[0, -Math.PI / 2, 0]}
    size={[30, 5, 0.1]}
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
  {[10, 65].map((zPos) => (
  <ArtFrame
    key={`right-frame-${zPos}`}
    position={[4.9, 2, zPos]}
    rotation={[0, -Math.PI / 2, 0]}
  />
))}

</group>



      {/* Side Room on the Right */}
      <group position={[10, 0, 37.5]}>
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
        {/* No Left Wall (open to the main hall) */}
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

     {/* New Side Room closer to the start point */}
<group position={[10, 0, 10]}>
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
  {/* No Left Wall (open to the main hall) */}
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

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Texture load
const textureLoader = new TextureLoader();
const floorTexture = textureLoader.load('/textures/laminate_floor_02_diff_4k.jpg', (texture) => {
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(3, 21);
floorTexture.needsUpdate = true;
});
const ceilingTexture = textureLoader.load('/textures/beige_wall_001_diff_4k.jpg', (texture) => {
  ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(5, 5);
ceilingTexture.needsUpdate = true;
});
const wallTexture = textureLoader.load('/textures/brick_wall_10_diff_4k.jpg', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
});
const moldingTexture = textureLoader.load('/textures/painted_plaster_wall_disp_4k.png', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1); // Start with a 1:1 scale and adjust in Wall component
  moldingTexture.needsUpdate = true;
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
const moldingMaterial = new THREE.MeshStandardMaterial({
  map: moldingTexture,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});

// Wall component
function Wall({ position, rotation, size }) {
  const wallRef = useRef();

  useEffect(() => {
    if (wallRef.current) {
      const geometry = wallRef.current.geometry;
      const uvAttribute = geometry.attributes.uv;
      const width = size[0]; // X-axis size
      const height = size[1]; // Y-axis size

      // Adjust UV mapping based on the wall size
      for (let i = 0; i < uvAttribute.count; i++) {
        const u = uvAttribute.getX(i) * (width / 2);
        const v = uvAttribute.getY(i) * (height / 2);
        uvAttribute.setXY(i, u, v);
      }
      uvAttribute.needsUpdate = true;
    }
  }, [size]);

  return (
    <mesh ref={wallRef} position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={wallMaterial.map} />
    </mesh>
  );
}

function ArtFrame({ position, rotation, size = [1.5, 1, 0.1], image }) {
  const texture = image ? useLoader(THREE.TextureLoader, image) : null;

  // Fallback blank white texture
  const blankTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Ensure the texture loads correctly
  useEffect(() => {
    if (texture) {
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Define materials (image only on the front face)
  const materials = [
    new THREE.MeshStandardMaterial({ color: "#888888" }), // Right
    new THREE.MeshStandardMaterial({ color: "#888888" }), // Left
    new THREE.MeshStandardMaterial({ color: "#aaaaaa" }), // Top
    new THREE.MeshStandardMaterial({ color: "#aaaaaa" }), // Bottom
    new THREE.MeshStandardMaterial({ map: texture || blankTexture }), // Front (Art side)
    new THREE.MeshStandardMaterial({ color: "#555555" }), // Back
  ];

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      {materials.map((mat, index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} {...mat} />
      ))}
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

// Molding component
function Molding({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={moldingMaterial.map} />
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
  const cameraStartPosition = [0, 2, 72];

  return (
    <Canvas camera={{ position: cameraStartPosition, fov: 75 }}>
      <CameraController />
      <ambientLight intensity={.5} />
      <pointLight position={[0, 5, 37.5]} intensity={.75} />
      <pointLight position={[5, 5, 5]} intensity={.75} />
      <pointLight position={[-5, 5, 5]} intensity={.75} />

     {/* Main Hall */}
<group position={[0, 0, 0]}>
  {/* Floor */}
  <Floor position={[0, 0, 37.5]} size={[10, 0.1, 75]} />
  {/* Ceiling */}
  <Ceiling position={[0, 5, 37.5]} size={[10, 0.1, 75]} />
  {/* Walls */}
  {/* Left Wall */}
  <Wall position={[0, 2.5, 0]} rotation={[0, 0, 0]} size={[10, 5, 0.1]} />
  <Molding position={[-4.95, 4.9, 35]} rotation={[0, Math.PI, 0]} size={[0.1, 0.2, 75]} />
  <Molding position={[-4.95, .2, 35]} rotation={[0, Math.PI, 0]} size={[0.1, 0.3, 75]} />
  {/* Front Wall */}
  <Wall position={[0, 2.5, 75]} rotation={[0, Math.PI, 0]} size={[10, 5, 0.1]} />
  {/* Far Back Wall */}
  <Wall position={[-5, 2.5, 37.5]} rotation={[0, Math.PI / 2, 0]} size={[75, 5, 0.1]} />
  <Wall position={[-4, 2.5, 64]} rotation={[0, 0, 0]} size = {[3, 5, .3]} />
  {/* Right Wall */}
  <Molding position={[4.95, 4.9, 60]} rotation={[0, Math.PI, 0]} size={[0.1, 0.2, 30]} />
  <Molding position={[4.95, .2, 60]} rotation={[0, Math.PI, 0]} size={[0.1, 0.3, 30]} />
  {/*Corner Pillar 1 */}
  <Molding position={[5, 2.5, 45]} rotation={[0, Math.PI, 0]} size={[.5, 5, .5]} />
  <Molding position={[4.95, 4.9, 45]} rotation={[0, Math.PI, 0]} size={[.75, .2, .65]} />
  <Molding position={[4.95, .1, 45]} rotation={[0, Math.PI, 0]} size={[.75, .2, .65]} />
   {/*Corner Pillar 2 */}
   <Molding position={[5, 2.5, 30]} rotation={[0, Math.PI, 0]} size={[.5, 5, .5]} />
  <Molding position={[4.95, 4.9, 30]} rotation={[0, Math.PI, 0]} size={[.75, .2, .65]} />
  <Molding position={[4.95, .1, 30]} rotation={[0, Math.PI, 0]} size={[.75, .2, .65]} />
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
  <ArtFrame position={[-4.8, 2.3, 65]} rotation={[0, Math.PI / 2, 0]} size={[2, 3, 0.1]} image="/art/two_birds_(ptilonopus_auranthfrons)_1973.26.15.jpg"/>
  <ArtFrame position={[-4.8, 2.3, 61]} rotation={[0, Math.PI / 2, 0]} size={[3, 3, 0.1]} image="/art/washington_bridge_and_speedway,_new_york_2018.177.193.jpg"/>
  <ArtFrame position={[-4.8, 2.3, 56]} rotation={[0, Math.PI / 2, 0]} size={[4, 4, 0.1]} image="/art/architectural_fantasy_with_obelisks,_ruins,_and_a_piazza_1982.24.2.jpg"/>
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

    </Canvas>
  );
}

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
    const wallShape = new Shape();
    wallShape.moveTo(-5, 0);
    wallShape.lineTo(-5, 5);
    wallShape.lineTo(5, 5);
    wallShape.lineTo(5, 0);
    wallShape.lineTo(-5, 0);

    const openingWidth = 4;
    const openingHeight = 3;
    const openingShape = new Shape();
    openingShape.moveTo(-openingWidth / 2, 1);
    openingShape.lineTo(-openingWidth / 2, 1 + openingHeight);
    openingShape.lineTo(openingWidth / 2, 1 + openingHeight);
    openingShape.lineTo(openingWidth / 2, 1);
    openingShape.lineTo(-openingWidth / 2, 1);

    wallShape.holes.push(openingShape);

    const geometry = new THREE.ShapeGeometry(wallShape);

    return (
      <mesh position={position} rotation={rotation}>
        <primitive object={geometry} />
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
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.1, 30]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
      <Wall
        position={[-5, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        hasOpening={openings.left}
      />
      <Wall
        position={[5, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        hasOpening={openings.right}
      />
      <Wall
        position={[0, 2.5, -15]}
        rotation={[0, 0, 0]}
        hasOpening={openings.back}
      />
      <Wall
        position={[0, 2.5, 15]}
        rotation={[0, Math.PI, 0]}
        hasOpening={openings.front}
      />
      <Ceiling position={[0, 5, 0]} size={[10, 0.1, 30]} />
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
// Camera Controller with Collision Detection
function CameraController() {
  const { camera } = useThree();
  const touchData = useRef({ startX: 0, startY: 0, isTwoFinger: false });
  const speed = 0.5;
  const threshold = 20;

  const boundaries = [
    // Main Hall
    { xMin: -5, xMax: 5, zMin: -50, zMax: 50 },
    // Left Rooms
    { xMin: -15, xMax: -5, zMin: -45, zMax: -15 }, // Left Room 1
    { xMin: -15, xMax: -5, zMin: 15, zMax: 45 },   // Left Room 2
    // Right Rooms
    { xMin: 5, xMax: 15, zMin: -45, zMax: -15 },   // Right Room 1
    { xMin: 5, xMax: 15, zMin: 15, zMax: 45 },     // Right Room 2
  ];

  const [spring, api] = useSpring(() => ({
    position: camera.position.toArray(),
    rotationY: camera.rotation.y + Math.PI,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  useFrame(() => {
    camera.position.lerp(new Vector3(...spring.position.get()), 0.1);
    camera.rotation.set(0, spring.rotationY.get(), 0);
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
        const deltaX =
          (currentX + e.touches[1].clientX) / 2 -
          (touchData.current.startX + touchData.current.startX2) / 2;

        let newRotationY = rotationY.get() - deltaX * 0.005;

        api.start({ rotationY: newRotationY });

        touchData.current.startX = e.touches[0].clientX;
        touchData.current.startX2 = e.touches[1].clientX;
      } else if (!touchData.current.isTwoFinger) {
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
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [api, boundaries, camera, spring.position, spring.rotationY]);

  return null;
}
// Main Gallery component
export default function GalleryApp() {
  const cameraStartPosition = [0, 2, 50];

  return (
    <Canvas camera={{ position: cameraStartPosition, fov: 75, rotation: [0, Math.PI, 0] }}>
      <CameraController />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />

      <axesHelper args={[5]} />
      <gridHelper args={[100, 100]} />

      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.1, 100]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>
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
        <Wall
          position={[-5, 2.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
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
        <Wall
          position={[5, 2.5, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <Wall position={[0, 2.5, 50]} rotation={[0, Math.PI, 0]} />
        <Wall position={[0, 2.5, -50]} />
        <Ceiling position={[0, 5, 0]} size={[10, 0.1, 100]} />
        {[-40, -20, 0, 20, 40].map((zPos) => (
          <ArtFrame
            key={`left-frame-${zPos}`}
            position={[-4.9, 2, zPos]}
            rotation={[0, Math.PI / 2, 0]}
          />
        ))}
        <InfoSign position={[0, 2.5, 49.9]} rotation={[0, Math.PI, 0]} />
        <mesh position={[0, 0.6, 47]}>
          <boxGeometry args={[1, 1.2, 1]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </group>
      <Room position={[-10, 0, 20]} openings={{ right: true }} />
      <Room position={[-10, 0, -20]} openings={{ right: true }} />
      <Room position={[10, 0, 20]} openings={{ left: true }} />
      <Room position={[10, 0, -20]} openings={{ left: true }} />
    </Canvas>
  );
}

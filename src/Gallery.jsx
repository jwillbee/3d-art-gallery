import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

// ArtFrame component for displaying the art
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

// Room component with walls, floor, and artframes
function Room({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2, -5]} receiveShadow>
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

function Doorway({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 3, 0.1]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}

export default function Gallery() {
  const { camera } = useThree();
  const speed = 0.1;

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowUp":
        camera.position.add(new Vector3(0, 0, -speed));
        break;
      case "ArrowDown":
        camera.position.add(new Vector3(0, 0, speed));
        break;
      case "ArrowLeft":
        camera.position.add(new Vector3(-speed, 0, 0));
        break;
      case "ArrowRight":
        camera.position.add(new Vector3(speed, 0, 0));
        break;
      default:
        break;
    }
  };

  const handleTouchStart = useRef(null);
  const handleTouchEnd = useRef(null);
  const startTouch = useRef({ x: 0, y: 0 });

  const handleTouchStartFn = (e) => {
    const touch = e.touches[0];
    startTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEndFn = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startTouch.current.x;
    const deltaY = touch.clientY - startTouch.current.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) {
        // Swipe right
        camera.position.add(new Vector3(speed, 0, 0));
      } else if (deltaX < -threshold) {
        // Swipe left
        camera.position.add(new Vector3(-speed, 0, 0));
      }
    } else {
      if (deltaY > threshold) {
        // Swipe down
        camera.position.add(new Vector3(0, 0, speed));
      } else if (deltaY < -threshold) {
        // Swipe up
        camera.position.add(new Vector3(0, 0, -speed));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStartFn);
    window.addEventListener("touchend", handleTouchEndFn);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStartFn);
      window.removeEventListener("touchend", handleTouchEndFn);
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 3, 15], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />

      {/* Render all rooms */}
      {rooms.map((room, index) => (
        <group key={index}>
          <Room position={room.position} rotation={room.rotation} />
          {room.position[0] !== 0 && (
            <Doorway position={room.position[0] < 0 ? [-5.5, 1.5, 0] : [5.5, 1.5, 0]} />
          )}
        </group>
      ))}
    </Canvas>
  );
}

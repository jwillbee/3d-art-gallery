import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Vector3, MathUtils } from "three";
import { animated, useSpring } from "@react-spring/three";

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

function Doorway({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 3, 0.1]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}

// CameraController component to handle touch events
function CameraController() {
  const { camera } = useThree();
  const speed = 2; // Adjust speed as needed
  const startTouch = useRef({ x: 0, y: 0 });

  const [springProps, setSpringProps] = useSpring(() => ({
    position: [camera.position.x, camera.position.y, camera.position.z],
  }));

  const moveCamera = (deltaX, deltaY) => {
    setSpringProps({
      position: [
        MathUtils.clamp(camera.position.x + deltaX, -15, 15),
        camera.position.y,
        MathUtils.clamp(camera.position.z + deltaY, -30, 10),
      ],
      onFrame: ({ position }) => {
        camera.position.set(position[0], position[1], position[2]);
      },
    });
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startTouch.current = { x: touch.clientX, y: touch.clientY };
      console.log("Touch Start:", startTouch.current);
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startTouch.current.x;
      const deltaY = touch.clientY - startTouch.current.y;
      const threshold = 30; // Minimum swipe distance

      console.log("Touch End:", { x: touch.clientX, y: touch.clientY });
      console.log("Delta:", { x: deltaX, y: deltaY });

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
          // Swipe right
          moveCamera(-speed, 0);
          console.log("Swiped Right");
        } else if (deltaX < -threshold) {
          // Swipe left
          moveCamera(speed, 0);
          console.log("Swiped Left");
        }
      } else {
        if (deltaY > threshold) {
          // Swipe down
          moveCamera(0, speed);
          console.log("Swiped Down");
        } else if (deltaY < -threshold) {
          // Swipe up
          moveCamera(0, -speed);
          console.log("Swiped Up");
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [camera, setSpringProps]);

  return null;
}

export default function Gallery() {
  // Rooms configuration
  const rooms = [
    { position: [0, 0, 0], rotation: [0, 0, 0] },
    { position: [-10, 0, 0], rotation: [0, 0, 0] },
    { position: [10, 0, 0], rotation: [0, 0, 0] },
  ];

  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
      {/* Camera controller */}
      <CameraController />

      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* Render all rooms */}
      {rooms.map((room, index) => (
        <group key={index} position={room.position} rotation={room.rotation}>
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

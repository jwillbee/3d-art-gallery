import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

// Room component with art and sign
function Room({ position, isActive, onClick, artFrames, roomName }) {
  const { position: animatedPos } = useSpring({
    position: isActive ? [0, 0, 0] : position,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <animated.group position={animatedPos} onClick={onClick}>
      {/* Floor */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[2, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-2, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Doorway */}
      <mesh position={[0, 1, 2]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="white" transparent opacity={0.2} />
      </mesh>

      {/* Artframes */}
      {artFrames.map((frame, index) => (
        <mesh key={index} position={frame.position}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial color="black" />
          <textGeometry args={[frame.artText]} />
        </mesh>
      ))}

      {/* Room Sign */}
      <mesh position={[0, 2, 2]}>
        <textGeometry args={[roomName, { size: 1, height: 0.1 }]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </animated.group>
  );
}

// Main Gallery component
export default function Gallery() {
  const [activeRoom, setActiveRoom] = useState(0);
  const rooms = [
    { position: [0, 0, 0], artFrames: [{ position: [0, 0, -2], artText: "Art 1" }, { position: [0, 1, -2], artText: "Art 2" }], roomName: "Room 1" },
    { position: [4, 0, 0], artFrames: [{ position: [0, 0, -2], artText: "Art 3" }, { position: [0, 1, -2], artText: "Art 4" }], roomName: "Room 2" },
    { position: [-4, 0, 0], artFrames: [{ position: [0, 0, -2], artText: "Art 5" }, { position: [0, 1, -2], artText: "Art 6" }], roomName: "Room 3" },
  ];

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      
      {/* Main entry banner */}
      <mesh position={[0, 3, 5]}>
        <textGeometry args={["Welcome to the Gallery", { size: 1, height: 0.1 }]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Render rooms */}
      {rooms.map((room, index) => (
        <Room
          key={index}
          position={room.position}
          isActive={index === activeRoom}
          onClick={() => setActiveRoom(index)}
          artFrames={room.artFrames}
          roomName={room.roomName}
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
}

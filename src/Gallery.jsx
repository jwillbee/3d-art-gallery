import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

function Room({ position, onClick, isActive }) {
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
      {/* Open Doorway */}
      <mesh position={[0, 1, 2]}>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="white" transparent opacity={0.2} />
      </mesh>
    </animated.group>
  );
}

export default function Gallery() {
  const [activeRoom, setActiveRoom] = useState(0);
  const rooms = [
    { position: [0, 0, 0] },
    { position: [4, 0, 0] },
    { position: [-4, 0, 0] },
  ];

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      {rooms.map((room, index) => (
        <Room
          key={index}
          position={room.position}
          isActive={index === activeRoom}
          onClick={() => setActiveRoom(index)}
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
}

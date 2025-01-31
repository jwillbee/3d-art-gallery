import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// ArtFrame component for displaying the art
function ArtFrame({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

// Sign component for room signs
function Sign({ position, text }) {
  return (
    <mesh position={position}>
      <textGeometry args={[text, { size: 0.2, height: 0.05 }]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

// Room component with walls, floor, artframes, and a sign
function Room({ position, rotation, name }) {
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

      {/* Sign */}
      {name && <Sign position={[0, 3.8, -4.5]} text={name} />}
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
  const cameraRef = useRef();

  // Rooms configuration
  const rooms = [
    { position: [0, 0, 0], name: "Main Room" },
    { position: [-10, 0, 0], name: "Left Room", rotation: [0, Math.PI / 2, 0] },
    { position: [10, 0, 0], name: "Right Room", rotation: [0, -Math.PI / 2, 0] }
  ];

  return (
    <Canvas camera={{ position: [0, 3, 15], fov: 50 }} ref={cameraRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} />

      {/* Render all rooms */}
      {rooms.map((room, index) => (
        <group key={index}>
          <Room position={room.position} rotation={room.rotation} name={room.name} />
          {room.position[0] !== 0 && (
            <Doorway position={room.position[0] < 0 ? [-5.5, 1.5, 0] : [5.5, 1.5, 0]} />
          )}
        </group>
      ))}

      <OrbitControls />
    </Canvas>
  );
}

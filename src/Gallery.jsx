import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function Gallery() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} castShadow />
      
      {/* Gallery Walls */}
      <mesh position={[0, 0, -5]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Artwork on the Wall */}
      <mesh position={[-3, 1, -4.9]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={useTexture("/art/art1.jpg")} />
      </mesh>
      <mesh position={[3, 1, -4.9]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={useTexture("/art/art2.jpg")} />
      </mesh>
      
      {/* Camera Controls */}
      <OrbitControls />
    </Canvas>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Gallery />
    </Suspense>
  );
}

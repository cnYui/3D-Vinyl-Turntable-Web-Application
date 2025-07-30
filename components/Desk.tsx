import React from 'react';

interface DeskProps {
  position?: [number, number, number];
}

export function Desk({ position = [0, 0, 0] }: DeskProps) {
  return (
    <group position={position}>
      {/* Main desk surface */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.2, 6]} />
        <meshStandardMaterial 
          color="#3c2f2f" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Wood grain detail */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[7.8, 0.01, 5.8]} />
        <meshStandardMaterial 
          color="#4a3838" 
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* Brass corner details */}
      {[-3.8, 3.8].map((x) => 
        [-2.8, 2.8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.12, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
        ))
      )}

      {/* Desk legs */}
      {[-3, 3].map((x) => 
        [-2, 2].map((z) => (
          <mesh key={`leg-${x}-${z}`} position={[x, -0.5, z]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1, 12]} />
            <meshStandardMaterial 
              color="#2d1810" 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        ))
      )}
    </group>
  );
}
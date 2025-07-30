import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface VinylRecordProps {
  position?: [number, number, number];
  record: {
    id: string;
    title: string;
    artist: string;
    cover: string;
    color: string;
  };
  isPlaying?: boolean;
  scale?: [number, number, number];
}

export function VinylRecord({ 
  position = [0, 0, 0], 
  record, 
  isPlaying = false,
  scale = [1, 1, 1]
}: VinylRecordProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && isPlaying) {
      meshRef.current.rotation.y += delta * 1.8; // 33 RPM simulation
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Main vinyl disc */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.05, 64]} />
        <meshStandardMaterial 
          color={record.color || "#1a1a1a"}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Center label */}
      <mesh position={[0, 0.026, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
        <meshStandardMaterial 
          color="#dc2626"
          roughness={0.3}
        />
      </mesh>

      {/* Center hole */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial 
          color="#000000"
        />
      </mesh>

      {/* Groove lines (simplified) */}
      {Array.from({ length: 20 }, (_, i) => {
        const radius = 0.5 + (i * 0.06);
        return (
          <mesh key={i} position={[0, 0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.01, 64]} />
            <meshStandardMaterial 
              color="#333333"
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}
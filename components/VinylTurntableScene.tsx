import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Turntable } from './Turntable';
import { Desk } from './Desk';
import { GlassCabinet } from './GlassCabinet';
import { VinylRecord } from './VinylRecord';
import { useAudio } from './AudioProvider';
import * as THREE from 'three';

export function VinylTurntableScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { isPlaying, currentRecord } = useAudio();

  useFrame((state) => {
    // Subtle ambient movement
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Desk surface */}
      <Desk position={[0, -0.5, 0]} />
      
      {/* Main turntable */}
      <Turntable position={[0, 0, 0]} />
      
      {/* Current vinyl record on turntable */}
      {currentRecord && (
        <VinylRecord
          position={[0, 0.12, 0]}
          record={currentRecord}
          isPlaying={isPlaying}
          scale={[0.8, 0.8, 0.8]}
        />
      )}
      
      {/* Glass cabinet with vinyl collection */}
      <GlassCabinet position={[0, 1, -4]} />
      
    </group>
  );
}
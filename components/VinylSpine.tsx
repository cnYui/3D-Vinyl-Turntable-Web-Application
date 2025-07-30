import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useAudio } from './AudioProvider';
import * as THREE from 'three';

import { VinylRecord } from '../src/data/vinylCollection';

interface VinylSpineProps {
  position?: [number, number, number];
  record: VinylRecord;
  onClick: () => void;
  onDragStart?: (event: any) => void;
}

export function VinylSpine({ position = [0, 0, 0], record, onClick, onDragStart }: VinylSpineProps) {
  const { setHoveredRecord, hoveredRecord, currentRecord, isPlaying } = useAudio();
  const vinylRef = useRef<THREE.Group>(null);
  
  // 检查当前唱片是否被悬停
  const isHovered = hoveredRecord?.id === record.id;
  // 检查当前唱片是否正在播放
  const isCurrentlyPlaying = currentRecord?.id === record.id && isPlaying;
  
  // Uniform height but thicker records - full shelf depth
  const thickness = 0.08 + Math.random() * 0.04; // Thicker records: 0.08-0.12
  const height = 4.5; // Taller height for better visual impact
  const depth = 0.8; // Same depth as cabinet shelf

  // 创建唱片花纹纹理
  const vinylTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // 黑色背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 512);
    
    // 绘制同心圆纹路（唱片的沟槽）
    const centerX = 256;
    const centerY = 256;
    
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // 绘制多个同心圆
    for (let radius = 20; radius < 250; radius += 8) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 添加一些随机的细节纹路
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const startRadius = 30;
      const endRadius = 240;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * startRadius,
        centerY + Math.sin(angle) * startRadius
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * endRadius,
        centerY + Math.sin(angle) * endRadius
      );
      ctx.stroke();
    }
    
    // 中心标签区域
    ctx.fillStyle = record.color || '#4a4a4a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心孔
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [record.color]);

  // 旋转动画
  useFrame((state, delta) => {
    if (vinylRef.current && isCurrentlyPlaying) {
      // 播放时顺时针旋转
      vinylRef.current.rotation.z += delta * 2; // 调整旋转速度
    }
  });

  return (
    <group position={position}>
      {/* Main record body - like a book with full shelf depth */}
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHoveredRecord(record);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHoveredRecord(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (onDragStart) onDragStart(e);
        }}
        castShadow
        position={[0, 0, -depth/2]}
      >
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial 
          color={isHovered ? "#2a2a2a" : "#1a1a1a"} // 悬停时稍微亮一些
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 移除唱片圆盘 */}

      {/* Front spine (visible colorful part) */}
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHoveredRecord(record);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHoveredRecord(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (onDragStart) onDragStart(e);
        }}
        castShadow
        position={[thickness/2, 0, 0]}
      >
        <boxGeometry args={[0.01, height, 0.05]} />
        <meshStandardMaterial 
          color={isCurrentlyPlaying ? "#fbbf24" : (isHovered ? "#fbbf24" : record.color || "#4a4a4a")}
          roughness={0.6}
          metalness={isCurrentlyPlaying ? 0.5 : (isHovered ? 0.3 : 0.1)}
          emissive={isCurrentlyPlaying ? "#fbbf24" : "#000000"}
          emissiveIntensity={isCurrentlyPlaying ? 0.2 : 0}
        />
      </mesh>

      {/* Artist text */}
      <Text
        position={[0, isHovered ? 0.5 : 0.3, 0.026]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={isHovered ? 0.09 : 0.08} // 悬停时文字稍大
        color={isCurrentlyPlaying ? "#fbbf24" : (isHovered ? "#fbbf24" : "#ffffff")} // 播放时变成金色
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {record.artist.toUpperCase()}
      </Text>

      {/* Title text */}
      <Text
        position={[0, isHovered ? 0 : -0.2, 0.026]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={isHovered ? 0.07 : 0.06} // 悬停时文字稍大
        color={isCurrentlyPlaying ? "#fbbf24" : (isHovered ? "#fbbf24" : "#cccccc")} // 播放时变成金色
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {record.title}
      </Text>

      {/* 播放指示器 - 小圆点 */}
      {isCurrentlyPlaying && (
        <mesh position={[0, -1.8, 0.03]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
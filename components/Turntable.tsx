import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAudio } from './AudioProvider';
import * as THREE from 'three';

interface TurntableProps {
  position?: [number, number, number];
}

export function Turntable({ position = [0, 0, 0] }: TurntableProps) {
  const platterRef = useRef<THREE.Mesh>(null);
  const tonearmRef = useRef<THREE.Group>(null);
  const vinylRef = useRef<THREE.Mesh>(null);
  const { isPlaying, playbackSpeed, currentRecord } = useAudio();

  // 创建唱片花纹纹理
  const vinylTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // 深黑色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // 绘制同心圆纹路（唱片的沟槽）
    const centerX = 512;
    const centerY = 512;
    
    // 外圈 - 更明显的边框
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 500, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制多个同心圆（唱片沟槽）- 增强对比度
    for (let radius = 80; radius < 480; radius += 6) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(100, 100, 100, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1.5 + Math.random() * 0.5;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 添加一些随机的细节纹路 - 增强可见性
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 200; i++) {
      const angle = (Math.PI * 2 * i) / 200;
      const startRadius = 80 + Math.random() * 50;
      const endRadius = 450 + Math.random() * 30;
      
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
    ctx.fillStyle = currentRecord?.color || '#4a4a4a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心标签边框
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.stroke();
    
    // 中心孔
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加一些随机的光泽效果
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 300;
      const size = 5 + Math.random() * 15;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance,
        size, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [currentRecord?.color]);

  useFrame((state, delta) => {
    // 旋转唱盘和唱片 - 使用正确的旋转轴
    if (platterRef.current && vinylRef.current && isPlaying) {
      // 唱盘和唱片同步旋转 - 使用正确的旋转轴
      const rotationSpeed = delta * playbackSpeed * 2.0; // 增加旋转速度
      // 因为我们的圆柱体是垂直放置的，所以应该绕Y轴旋转
      platterRef.current.rotation.y += rotationSpeed;
      vinylRef.current.rotation.y += rotationSpeed;
    }

    // 动画唱臂 - 播放时放下，停止时抬起
    if (tonearmRef.current) {
      const targetRotation = isPlaying ? 0.05 : -0.2;
      tonearmRef.current.rotation.z = THREE.MathUtils.lerp(
        tonearmRef.current.rotation.z,
        targetRotation,
        delta * 2
      );
    }
  });

  return (
    <group position={position}>
      {/* 底座 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 0.3, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>

      {/* 唱盘 - 保持垂直放置，但在水平面内旋转 */}
      <mesh ref={platterRef} position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 64]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>

      {/* 唱片 - 带花纹和旋转效果，保持垂直放置，但在水平面内旋转 */}
      <mesh ref={vinylRef} position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.75, 1.75, 0.03, 64]} />
        <meshStandardMaterial 
          map={vinylTexture}
          color="#ffffff"
          metalness={0.2}
          roughness={0.8}
          emissive={isPlaying ? "#111111" : "#000000"}
          emissiveIntensity={isPlaying ? 0.05 : 0}
        />
      </mesh>

      {/* 中心轴 */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>

      {/* 唱臂底座 */}
      <mesh position={[2.2, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial 
          color="#2d2d2d" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* 唱臂 */}
      <group ref={tonearmRef} position={[2.2, 0.4, 0]}>
        {/* 唱臂管 */}
        <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial 
            color="#6b7280" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>

        {/* 唱头壳 */}
        <mesh position={[-1.9, 0, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.1]} />
          <meshStandardMaterial 
            color="#374151" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>

        {/* 唱头/唱针 */}
        <mesh position={[-2, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          <meshStandardMaterial 
            color="#1f2937" 
            metalness={0.5} 
            roughness={0.6}
          />
        </mesh>
      </group>

      {/* 控制旋钮 */}
      <mesh position={[-1.5, 0.15, 1.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>

      <mesh position={[-1, 0.15, 1.5]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial 
          color="#6b7280" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>

      {/* LED指示灯 */}
      <mesh position={[0.5, 0.15, 1.5]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color={isPlaying ? "#10b981" : "#dc2626"} 
          emissive={isPlaying ? "#10b981" : "#dc2626"}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
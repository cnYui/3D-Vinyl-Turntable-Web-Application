import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { VinylSpine } from './VinylSpine';
import { useAudio } from './AudioProvider';
import * as THREE from 'three';

interface GlassCabinetProps {
  position?: [number, number, number];
}

export function GlassCabinet({ position = [0, 0, 0] }: GlassCabinetProps) {
  const { vinylCollection, selectRecord, hoveredRecord, setHoveredRecord, currentRecord, isPlaying } = useAudio();
  
  
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollOffset: 0 });
  const [velocity, setVelocity] = useState(0);
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false);
  const scrollGroupRef = useRef<THREE.Group>(null);
  const lastDragTimeRef = useRef(0);
  const lastDragPositionRef = useRef(0);
  const { camera, gl } = useThree();
  
  // 滑动控制
  const cabinetInnerWidth = 10.8; // 柜子内部宽度（去掉边框）
  const recordSpacing = 0.2; // 唱片间距
  const visibleRecords = Math.floor(cabinetInnerWidth / recordSpacing);
  const maxScroll = Math.max(0, (vinylCollection.length * recordSpacing) - cabinetInnerWidth);
  
  // 计算初始偏移量，确保第一张唱片完全可见
  React.useEffect(() => {
    // 初始化时设置一个小的偏移量，确保第一张唱片不被柜子边框遮挡
    setScrollOffset(-0.3);
  }, [vinylCollection.length]);
  
  // 鼠标拖动处理
  const handlePointerDown = (event: any) => {
    // 延迟启动拖拽，给悬停事件一些时间
    setTimeout(() => {
      setIsDragging(true);
      setIsInertiaScrolling(false);
      setVelocity(0);
      setDragStart({
        x: event.clientX,
        scrollOffset: scrollOffset
      });
      lastDragTimeRef.current = Date.now();
      lastDragPositionRef.current = event.clientX;
      gl.domElement.style.cursor = 'grabbing';
    }, 100); // 100ms延迟
  };

  const handlePointerMove = (event: any) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastDragTimeRef.current;
    const deltaX = event.clientX - dragStart.x;
    const sensitivity = 0.02; // 拖动敏感度
    const newScrollOffset = Math.max(0, Math.min(maxScroll, dragStart.scrollOffset - deltaX * sensitivity));
    
    // 计算速度 - 增强惯性效果
    if (deltaTime > 0) {
      const positionDelta = event.clientX - lastDragPositionRef.current;
      const currentVelocity = (positionDelta / deltaTime) * sensitivity * 2; // 增加速度倍数
      setVelocity(currentVelocity);
    }
    
    lastDragTimeRef.current = currentTime;
    lastDragPositionRef.current = event.clientX;
    setScrollOffset(newScrollOffset);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsInertiaScrolling(true);
    gl.domElement.style.cursor = 'default';
  };

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handlePointerMove(e);
      const handleGlobalMouseUp = () => handlePointerUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, scrollOffset, maxScroll]);
  
  // 惯性滑动动画
  useFrame((state, delta) => {
    if (scrollGroupRef.current) {
      const targetX = -scrollOffset;
      scrollGroupRef.current.position.x = targetX;
    }
    
    // 惯性滑动处理
    if (isInertiaScrolling && Math.abs(velocity) > 0.0005) {
      const friction = 0.98; // 增加摩擦系数，让滑动持续更久
      const newVelocity = velocity * friction;
      const newScrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset - newVelocity * 100 * delta)); // 增加速度倍数
      
      setScrollOffset(newScrollOffset);
      setVelocity(newVelocity);
      
      // 当速度足够小时停止惯性滑动
      if (Math.abs(newVelocity) < 0.0005) {
        setIsInertiaScrolling(false);
        setVelocity(0);
      }
    }
  });

  return (
    <group position={position}>
      {/* Cabinet frame - left side */}
      <mesh position={[-5.5, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Cabinet frame - right side */}
      <mesh position={[5.5, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Cabinet frame - top */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[11.2, 0.2, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Cabinet frame - bottom */}
      <mesh position={[0, -2.9, 0]} castShadow>
        <boxGeometry args={[11.2, 0.2, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Cabinet frame - back */}
      <mesh position={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[11.2, 6, 0.1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Interior back panel */}
      <mesh position={[0, 0, -0.49]}>
        <boxGeometry args={[5.8, 3.8, 0.02]} />
        <meshStandardMaterial 
          color="#2d1810" 
          roughness={0.6}
        />
      </mesh>

      {/* 剪切遮罩容器 - 隐藏超出柜子的部分 */}
      <group>
        {/* 剪切区域 - 只显示柜子内部的唱片 */}
        <group position={[-5.5, 0, 0]}>
          {/* 可滚动的唱片容器 */}
          <group ref={scrollGroupRef} position={[0.5, 0, 0.3]}>
            {vinylCollection.map((record, index) => {
              const xPos = (index * recordSpacing + 0.5) - scrollOffset;
              // 确保唱片在柜子内部可见区域，给第一张唱片留出足够空间
              if (xPos >= 0.3 && xPos <= 10.3) {
                // 计算相邻唱片的联动效果
                const isHovered = hoveredRecord?.id === record.id;
                const isLeftNeighbor = hoveredRecord && vinylCollection.findIndex(r => r.id === hoveredRecord.id) === index + 1;
                const isRightNeighbor = hoveredRecord && vinylCollection.findIndex(r => r.id === hoveredRecord.id) === index - 1;
                
                // 计算Y轴偏移：主唱片上升0.2，相邻唱片上升0.1
                let yOffset = 0;
                if (isHovered) {
                  yOffset = 0.2;
                } else if (isLeftNeighbor || isRightNeighbor) {
                  yOffset = 0.1;
                }
                
                return (
                  <group key={record.id} position={[index * recordSpacing, yOffset, 0]}>
                    <VinylSpine
                      record={record}
                      position={[0, 0, 0]}
                      onClick={() => selectRecord(record)}
                      onDragStart={handlePointerDown}
                    />
                  </group>
                );
              }
              return null;
            })}
          </group>
        </group>
      </group>

      {/* Cabinet handles */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, -1.5, 0.52]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
      ))}


      {/* 专辑信息显示区域 - 只保留文字，删除背景面板 */}
      <group position={[6.7, 0, 4]}> {/* 与柜子保持更远距离，向前移动4单位，向左移动1.3单位 */}

        {/* 显示内容 - 在悬停时或播放时显示歌曲信息 */}
        {(hoveredRecord || (isPlaying && currentRecord)) && (
          <>
            {/* 歌曲名称 - 白色字体 */}
            <Text
              position={[1.65, 1.0, 0.03]}
              rotation={[0, -Math.PI / 4, 0]}
              fontSize={0.35}
              color={isPlaying && !hoveredRecord ? "#fbbf24" : "#ffffff"}
              anchorX="center"
              anchorY="middle"
              maxWidth={6}
              textAlign="center"
            >
              {hoveredRecord ? hoveredRecord.title : currentRecord?.title}
            </Text>

            {/* 艺术家名称 - 浅灰色 */}
            <Text
              position={[1.65, 0.3, 0.03]}
              rotation={[0, -Math.PI / 4, 0]}
              fontSize={0.28}
              color={isPlaying && !hoveredRecord ? "#e8e8a0" : "#e0e0e0"}
              anchorX="center"
              anchorY="middle"
              maxWidth={6}
              textAlign="center"
            >
              {hoveredRecord ? hoveredRecord.artist : currentRecord?.artist}
            </Text>

            {/* 分隔线 - 白色半透明 */}
            <mesh
              position={[1.65, -0.2, 0.03]}
              rotation={[0, -Math.PI / 4, 0]}
            >
              <planeGeometry args={[4.2, 0.02]} />
              <meshStandardMaterial 
                color={isPlaying && !hoveredRecord ? "#fbbf24" : "#ffffff"}
                transparent 
                opacity={0.3}
              />
            </mesh>

            {/* 时长信息 - 浅白色 */}
            <Text
              position={[1.65, -0.8, 0.03]}
              rotation={[0, -Math.PI / 4, 0]}
              fontSize={0.22}
              color={isPlaying && !hoveredRecord ? "#e8e8a0" : "#cccccc"}
              anchorX="center"
              anchorY="middle"
              maxWidth={6}
              textAlign="center"
            >
              时长: {Math.floor((hoveredRecord || currentRecord)!.duration / 60)}:{((hoveredRecord || currentRecord)!.duration % 60).toString().padStart(2, '0')}
            </Text>
            
            {/* 播放状态指示 - 只在播放时显示 */}
            {isPlaying && !hoveredRecord && (
              <Text
                position={[1.65, -1.5, 0.03]}
                rotation={[0, -Math.PI / 4, 0]}
                fontSize={0.22}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
                maxWidth={6}
                textAlign="center"
              >
                ♪ 正在播放 ♪
              </Text>
            )}
          </>
        )}
      </group>
    </group>
  );
}
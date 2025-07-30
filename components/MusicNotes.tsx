import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useAudio } from './AudioProvider';
import * as THREE from 'three';

interface MusicNotesProps {
  position?: [number, number, number];
}

interface Note {
  id: number;
  symbol: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
  rotationSpeed: number;
}

export function MusicNotes({ position = [0, 0, 0] }: MusicNotesProps) {
  const { isPlaying } = useAudio();
  const notesRef = useRef<Note[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // 音符符号数组
  const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞'];

  // 创建新音符的函数
  const createNote = (): Note => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    const height = -1 + Math.random() * 2;
    
    return {
      id: Math.random(),
      symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3, // 减小水平速度
        0.6 + Math.random() * 0.6, // 增加垂直速度
        (Math.random() - 0.5) * 0.3  // 减小水平速度
      ),
      life: 0,
      maxLife: 4 + Math.random() * 2, // 4-6秒生命周期
      scale: 0.3 + Math.random() * 0.4, // 0.3-0.7的随机大小
      rotationSpeed: (Math.random() - 0.5) * 1.5
    };
  };

  useFrame((state, delta) => {
    // 使用更平滑的 delta 时间，防止帧率波动导致卡顿
    const smoothDelta = Math.min(0.03, delta);
    timeRef.current += smoothDelta;

    if (isPlaying) {
      // 每1.5秒生成一个新音符，让音符出现得更慢
      if (timeRef.current > 1.5) {
        notesRef.current.push(createNote());
        timeRef.current = 0;
        
        // 限制最大音符数量为12，以提高性能
        if (notesRef.current.length > 12) {
          notesRef.current.shift();
        }
      }

      // 更新现有音符
      notesRef.current.forEach(note => {
        note.life += smoothDelta;
        
        // 更新位置
        note.position.add(note.velocity.clone().multiplyScalar(smoothDelta));
        
        // 减弱重力效果，让动画更平滑
        note.velocity.y -= smoothDelta * 0.2;
      });

      // 移除生命周期结束的音符
      notesRef.current = notesRef.current.filter(note => note.life < note.maxLife);
    } else {
      // 停止播放时清除所有音符
      notesRef.current = [];
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {notesRef.current.map(note => {
        // 计算透明度（生命周期的淡入淡出效果）
        const fadeInTime = 1.5; // 延长出现时间为1.5秒
        const fadeOutTime = 2.0; // 延长消失时间为2.0秒
        let opacity = 1;
        
        if (note.life < fadeInTime) {
          // 缓缓变亮
          opacity = note.life / fadeInTime;
        } else if (note.life > note.maxLife - fadeOutTime) {
          // 缓缓变暗
          opacity = (note.maxLife - note.life) / fadeOutTime;
        }

        // 使用固定的黄色，避免每帧计算颜色
        const color = '#fbbf24';

        return (
          <Text
            key={note.id}
            position={[note.position.x, note.position.y, note.position.z]}
            rotation={[0, note.life * note.rotationSpeed, 0]}
            fontSize={note.scale}
            color={color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={opacity}
          >
            {note.symbol}
          </Text>
        );
      })}
    </group>
  );
}
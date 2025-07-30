import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { VinylTurntableScene } from "./components/VinylTurntableScene";
import { MusicNotes } from "./components/MusicNotes";
import { AudioProvider } from "./components/AudioProvider";
import { PlayerControls } from "./components/PlayerControls";
import { LoadingScreen } from "./components/LoadingScreen";
import { Button } from "./components/ui/button";

export default function App() {
  const [isViewLocked, setIsViewLocked] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 to-stone-950 dark">
      <AudioProvider>
        <div className="relative h-screen overflow-hidden">
          {/* 3D Scene */}
          <div className="absolute inset-0">
            <Canvas
              camera={{
                position: [4, 6, 8],
                fov: 50,
                near: 0.1,
                far: 100,
              }}
              shadows
              className="bg-gradient-to-b from-amber-950/50 to-stone-950"
            >
              <Suspense fallback={null}>
                {/* Lighting setup for realistic materials */}
                <ambientLight intensity={0.2} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight
                  position={[-5, 5, 5]}
                  intensity={0.5}
                  color="#fbbf24"
                />

                {/* Environment for reflections */}
                <Environment preset="warehouse" />

                {/* Main scene */}
                <VinylTurntableScene />

                {/* Music notes effect */}
                <MusicNotes />

                {/* Camera controls - can be locked/unlocked */}
                <OrbitControls
                  target={[0, 0, 0]}
                  enablePan={!isViewLocked}
                  enableZoom={!isViewLocked}
                  enableRotate={!isViewLocked}
                  minDistance={6}
                  maxDistance={20}
                  minPolarAngle={Math.PI / 8}
                  maxPolarAngle={Math.PI / 2}
                  minAzimuthAngle={-Math.PI}
                  maxAzimuthAngle={Math.PI}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Loading screen */}
          <Suspense fallback={<LoadingScreen />}>
            <div />
          </Suspense>

          {/* UI Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 pointer-events-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl text-amber-200 tracking-wide">
                      VINTAGE TURNTABLE
                    </h1>
                    <p className="text-amber-300/70 mt-2">
                      Select a record from the cabinet to begin
                    </p>
                  </div>
                  
                  {/* 视角锁定按钮 */}
                  <Button
                    onClick={() => setIsViewLocked(!isViewLocked)}
                    variant={isViewLocked ? "default" : "outline"}
                    className="ml-4"
                  >
                    {isViewLocked ? "🔒 视角已锁定" : "🔓 锁定视角"}
                  </Button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* 小型播放控制窗口 - 放在柜子上方 */}
              <div className="p-4 pointer-events-auto flex justify-center">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 w-auto max-w-xs">
                  <PlayerControls compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AudioProvider>
    </div>
  );
}
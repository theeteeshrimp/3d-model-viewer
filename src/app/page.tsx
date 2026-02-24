'use client';

import { useState, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Upload, Download, Camera, Sun, Grid3X3, Box as BoxIcon } from 'lucide-react';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

function Scene({ modelUrl, wireframe, showGrid }: { modelUrl: string | null; wireframe: boolean; showGrid: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} />
      
      {showGrid && <Grid infinite fadeDistance={50} fadeStrength={5} />}
      
      <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      
      <Suspense fallback={<Box><meshBasicMaterial wireframe color="white" /></Box>}>
        {modelUrl ? (
          <Model url={modelUrl} />
        ) : (
          <group>
            <Box args={[1, 1, 1]} position={[-1.5, 0.5, 0]}>
              <meshStandardMaterial color="orange" wireframe={wireframe} />
            </Box>
            <Sphere args={[0.7, 32, 32]} position={[1.5, 0.7, 0]}>
              <meshStandardMaterial color="hotpink" wireframe={wireframe} />
            </Sphere>
          </group>
        )}
      </Suspense>
      
      <OrbitControls makeDefault />
    </>
  );
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = '3d-model-screenshot.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🎲 3D Model Viewer</h1>
          
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".gltf,.glb,.obj,.fbx"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              Load Model
            </button>
            
            <button
              onClick={takeScreenshot}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Camera size={18} />
              Screenshot
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Controls */}
        <aside className="w-72 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Display Options</h3>
              
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wireframe}
                  onChange={(e) => setWireframe(e.target.checked)}
                  className="w-5 h-5"
                />
                Wireframe Mode
              </label>
              
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-5 h-5"
                />
                Show Grid
              </label>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Background</h3>
              <div className="flex gap-2">
                {['#1a1a2e', '#000000', '#ffffff', '#1e293b'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      bgColor === color ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Instructions</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>🖱️ Left click + drag to rotate</li>
                <li>🖱️ Right click + drag to pan</li>
                <li>🖱️ Scroll to zoom</li>
                <li>📁 Supports: GLTF, GLB, OBJ</li>
              </ul>
            </div>

            {!modelUrl && (
              <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                <p className="text-blue-300 text-sm">👆 Upload a 3D model to view it, or play with the default shapes!</p>
              </div>
            )}
          </div>
        </aside>

        {/* 3D Canvas */}
        <main className="flex-1 relative">
          <Canvas
            ref={canvasRef}
            camera={{ position: [5, 5, 5], fov: 50 }}
            style={{ background: bgColor }}
          >
            <Scene modelUrl={modelUrl} wireframe={wireframe} showGrid={showGrid} />
          </Canvas>
          
          <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
            Powered by Three.js + React Three Fiber
          </div>
        </main>
      </div>
    </div>
  );
}

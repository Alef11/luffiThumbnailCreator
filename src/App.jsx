import React, { useRef } from 'react';
import EditorCanvas from './components/EditorCanvas';
import Toolbar from './components/Toolbar';
import LayersPanel from './components/LayersPanel';
import InspectorPanel from './components/InspectorPanel';
import './App.css';

export default function App() {
  const stageRef = useRef(null);

  return (
    <div className="app">
      <Toolbar stageRef={stageRef} />
      <div className="workspace">
        <LayersPanel />
        <div className="canvas-area">
          <EditorCanvas stageRef={stageRef} />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
}

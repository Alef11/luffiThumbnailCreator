import React, { useCallback, useRef } from 'react';
import useStore, { CANVAS_WIDTH } from '../store';

export default function Toolbar({ stageRef }) {
  const addText = useStore((s) => s.addText);
  const getProjectJSON = useStore((s) => s.getProjectJSON);
  const loadProjectJSON = useStore((s) => s.loadProjectJSON);
  const fileInputRef = useRef(null);

  const handleExport = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Hide transformer for clean export
    const tr = stage.findOne('Transformer');
    if (tr) tr.visible(false);
    stage.findOne('Layer').batchDraw();

    const uri = stage.toDataURL({
      pixelRatio: CANVAS_WIDTH / stage.width(),
      mimeType: 'image/png',
    });

    // Restore transformer
    if (tr) tr.visible(true);
    stage.findOne('Layer').batchDraw();

    const link = document.createElement('a');
    link.download = 'thumbnail.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stageRef]);

  const handleSave = useCallback(() => {
    const json = getProjectJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'thumbnail-project.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [getProjectJSON]);

  const handleLoad = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        loadProjectJSON(reader.result);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [loadProjectJSON]
  );

  return (
    <div className="toolbar">
      <span className="app-title">Thumbnail Creator</span>
      <div className="separator" />

      <button onClick={addText}>+ Text</button>
      <div className="separator" />

      <div className="spacer" />

      <button onClick={handleSave}>Save Project</button>
      <button onClick={() => fileInputRef.current?.click()}>Load Project</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoad}
        style={{ display: 'none' }}
      />
      <div className="separator" />
      <button className="primary" onClick={handleExport}>
        Export PNG
      </button>
    </div>
  );
}

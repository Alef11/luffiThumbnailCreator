import React from 'react';
import useStore from '../store';
import { fontNames } from '../fontCatalog';

export default function InspectorPanel() {
  const layers = useStore((s) => s.layers);
  const selectedId = useStore((s) => s.selectedId);
  const updateLayer = useStore((s) => s.updateLayer);
  const deleteLayer = useStore((s) => s.deleteLayer);
  const duplicateLayer = useStore((s) => s.duplicateLayer);

  const layer = layers.find((l) => l.id === selectedId);

  if (!layer) {
    return (
      <div className="right-panel">
        <div className="inspector-empty">
          Select a sticker or text element to edit its properties.
          <br /><br />
          Tip: Click elements on the canvas, or use the Layers panel on the left.
        </div>
      </div>
    );
  }

  const set = (key, value) => updateLayer(layer.id, { [key]: value });
  const setNum = (key, e) => set(key, parseFloat(e.target.value) || 0);

  return (
    <div className="right-panel">
      {/* Name */}
      <div className="panel-section">
        <div className="section-title">
          {layer.type === 'sticker' ? 'Sticker' : 'Text'} Properties
        </div>
        <div className="field-row">
          <label>Name</label>
          <input
            type="text"
            value={layer.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
      </div>

      {/* Text content */}
      {layer.type === 'text' && (
        <div className="panel-section">
          <div className="section-title">Content</div>
          <textarea
            value={layer.text}
            onChange={(e) => set('text', e.target.value)}
            rows={2}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Typography (text only) */}
      {layer.type === 'text' && (
        <div className="panel-section">
          <div className="section-title">Typography</div>

          <div className="field-row">
            <label>Font</label>
            <select
              value={layer.fontFamily}
              onChange={(e) => set('fontFamily', e.target.value)}
            >
              {fontNames.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <label>Size</label>
            <input
              type="number"
              min="8"
              max="400"
              value={layer.fontSize}
              onChange={(e) => setNum('fontSize', e)}
            />
          </div>

          <div className="field-row">
            <label>Style</label>
            <select
              value={layer.fontStyle}
              onChange={(e) => set('fontStyle', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
              <option value="bold italic">Bold Italic</option>
            </select>
          </div>

          <div className="field-row">
            <label>Spacing</label>
            <input
              type="number"
              min="-10"
              max="50"
              value={layer.letterSpacing}
              onChange={(e) => setNum('letterSpacing', e)}
            />
          </div>

          <div className="field-row">
            <label>Align</label>
            <select
              value={layer.align}
              onChange={(e) => set('align', e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}

      {/* Colors (text) */}
      {layer.type === 'text' && (
        <div className="panel-section">
          <div className="section-title">Colors</div>

          <div className="field-row">
            <label>Fill</label>
            <input
              type="color"
              value={layer.fill}
              onChange={(e) => set('fill', e.target.value)}
            />
            <input
              type="text"
              value={layer.fill}
              onChange={(e) => set('fill', e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          <div className="field-row">
            <label>Stroke</label>
            <input
              type="color"
              value={layer.stroke || '#000000'}
              onChange={(e) => set('stroke', e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="20"
              value={layer.strokeWidth}
              onChange={(e) => setNum('strokeWidth', e)}
              style={{ width: 50 }}
            />
            <span style={{ fontSize: 10, color: '#888' }}>px</span>
          </div>
        </div>
      )}

      {/* Shadow (text) */}
      {layer.type === 'text' && (
        <div className="panel-section">
          <div className="section-title">Shadow</div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="shadow-toggle"
              checked={layer.shadowEnabled}
              onChange={(e) => set('shadowEnabled', e.target.checked)}
            />
            <label htmlFor="shadow-toggle">Enable shadow</label>
          </div>

          {layer.shadowEnabled && (
            <>
              <div className="field-row">
                <label>Color</label>
                <input
                  type="color"
                  value={layer.shadowColor}
                  onChange={(e) => set('shadowColor', e.target.value)}
                />
              </div>
              <div className="field-row">
                <label>Blur</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={layer.shadowBlur}
                  onChange={(e) => setNum('shadowBlur', e)}
                />
                <span style={{ fontSize: 11, width: 24 }}>{layer.shadowBlur}</span>
              </div>
              <div className="field-row">
                <label>Offset X</label>
                <input
                  type="number"
                  min="-30"
                  max="30"
                  value={layer.shadowOffsetX}
                  onChange={(e) => setNum('shadowOffsetX', e)}
                />
              </div>
              <div className="field-row">
                <label>Offset Y</label>
                <input
                  type="number"
                  min="-30"
                  max="30"
                  value={layer.shadowOffsetY}
                  onChange={(e) => setNum('shadowOffsetY', e)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Hue rotation (sticker) */}
      {layer.type === 'sticker' && (
        <div className="panel-section">
          <div className="section-title">Recolor</div>
          <div className="field-row">
            <label>Hue</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={layer.hueRotation}
              onChange={(e) => setNum('hueRotation', e)}
            />
            <span style={{ fontSize: 11, width: 30, textAlign: 'right' }}>
              {layer.hueRotation}&deg;
            </span>
          </div>
          <div
            style={{
              height: 20,
              borderRadius: 4,
              background: `linear-gradient(to right,
                hsl(${layer.hueRotation + 0}, 80%, 50%),
                hsl(${layer.hueRotation + 60}, 80%, 50%),
                hsl(${layer.hueRotation + 120}, 80%, 50%),
                hsl(${layer.hueRotation + 180}, 80%, 50%),
                hsl(${layer.hueRotation + 240}, 80%, 50%),
                hsl(${layer.hueRotation + 300}, 80%, 50%),
                hsl(${layer.hueRotation + 360}, 80%, 50%)
              )`,
              marginBottom: 4,
            }}
          />
        </div>
      )}

      {/* Transform */}
      <div className="panel-section">
        <div className="section-title">Transform</div>

        <div className="field-row">
          <label>X</label>
          <input
            type="number"
            value={Math.round(layer.x)}
            onChange={(e) => setNum('x', e)}
          />
          <label style={{ minWidth: 20 }}>Y</label>
          <input
            type="number"
            value={Math.round(layer.y)}
            onChange={(e) => setNum('y', e)}
          />
        </div>

        <div className="field-row">
          <label>Rotation</label>
          <input
            type="range"
            min="-180"
            max="180"
            value={Math.round(layer.rotation)}
            onChange={(e) => setNum('rotation', e)}
          />
          <span style={{ fontSize: 11, width: 36, textAlign: 'right' }}>
            {Math.round(layer.rotation)}&deg;
          </span>
        </div>

        <div className="field-row">
          <label>Scale X</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={parseFloat(layer.scaleX.toFixed(2))}
            onChange={(e) => setNum('scaleX', e)}
          />
          <label style={{ minWidth: 20 }}>Y</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={parseFloat(layer.scaleY.toFixed(2))}
            onChange={(e) => setNum('scaleY', e)}
          />
        </div>

        {layer.type === 'sticker' && (
          <div className="field-row">
            <label>Width</label>
            <input
              type="number"
              min="10"
              max="2000"
              value={Math.round(layer.width)}
              onChange={(e) => setNum('width', e)}
            />
            <label style={{ minWidth: 20 }}>H</label>
            <input
              type="number"
              min="10"
              max="2000"
              value={Math.round(layer.height)}
              onChange={(e) => setNum('height', e)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="panel-section">
        <div className="btn-row">
          <button onClick={() => duplicateLayer(layer.id)}>Duplicate</button>
          <button className="danger" onClick={() => deleteLayer(layer.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useRef, useState, useEffect } from 'react';
import useStore from '../store';
import stickerCatalog from '../stickerCatalog';

const BLEND_MODES = [
  'overlay',
  'multiply',
  'screen',
  'soft-light',
  'hard-light',
  'color-dodge',
  'color-burn',
  'normal',
];

export default function LayersPanel() {
  const layers = useStore((s) => s.layers);
  const selectedId = useStore((s) => s.selectedId);
  const gradient = useStore((s) => s.gradient);
  const selectLayer = useStore((s) => s.selectLayer);
  const deleteLayer = useStore((s) => s.deleteLayer);
  const duplicateLayer = useStore((s) => s.duplicateLayer);
  const moveLayerUp = useStore((s) => s.moveLayerUp);
  const moveLayerDown = useStore((s) => s.moveLayerDown);
  const toggleLayerVisibility = useStore((s) => s.toggleLayerVisibility);
  const addSticker = useStore((s) => s.addSticker);
  const setGradient = useStore((s) => s.setGradient);
  const setGradientStop = useStore((s) => s.setGradientStop);
  const addGradientStop = useStore((s) => s.addGradientStop);
  const removeGradientStop = useStore((s) => s.removeGradientStop);
  const setGradientStopPosition = useStore((s) => s.setGradientStopPosition);
  const uploadRef = useRef(null);

  // Right-click context menu state
  const [ctxMenu, setCtxMenu] = useState(null);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleUploadSticker = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        addSticker(reader.result, file.name.replace(/\.[^.]+$/, ''));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [addSticker]
  );

  // Display layers top-to-bottom (highest z-index first)
  const reversedLayers = [...layers].reverse();

  return (
    <div className="left-panel">
      {/* Sticker catalog */}
      <div className="panel-section">
        <div className="section-title">Stickers</div>
        <div className="sticker-grid">
          {stickerCatalog.map((s) => (
            <button
              key={s.name}
              className="sticker-btn"
              title={s.name}
              onClick={() => addSticker(s.src, s.name)}
            >
              <img src={s.src} alt={s.name} />
            </button>
          ))}
        </div>
        <button
          className="upload-btn"
          onClick={() => uploadRef.current?.click()}
        >
          + Upload image
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={handleUploadSticker}
          style={{ display: 'none' }}
        />
      </div>

      {/* Gradient controls */}
      <div className="panel-section">
        <div className="section-title">Gradient Overlay</div>

        {gradient.stops.map((stop, i) => (
          <div key={i} className="gradient-stop-row">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => setGradientStop(i, e.target.value)}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={stop.position}
              onChange={(e) =>
                setGradientStopPosition(i, parseFloat(e.target.value))
              }
              style={{ flex: 1 }}
            />
            <span className="stop-pos">{Math.round(stop.position * 100)}%</span>
            {gradient.stops.length > 2 && (
              <button
                className="remove-stop"
                onClick={() => removeGradientStop(i)}
                title="Remove stop"
              >
                x
              </button>
            )}
          </div>
        ))}

        {gradient.stops.length < 5 && (
          <button
            style={{ width: '100%', marginBottom: 8, fontSize: 11 }}
            onClick={addGradientStop}
          >
            + Add Color Stop
          </button>
        )}

        <div className="field-row">
          <label>Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={gradient.angle}
            onChange={(e) =>
              setGradient({ angle: parseInt(e.target.value) })
            }
          />
          <span style={{ fontSize: 11, width: 30, textAlign: 'right' }}>
            {gradient.angle}&deg;
          </span>
        </div>

        <div className="field-row">
          <label>Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={gradient.opacity}
            onChange={(e) =>
              setGradient({ opacity: parseFloat(e.target.value) })
            }
          />
          <span style={{ fontSize: 11, width: 30, textAlign: 'right' }}>
            {Math.round(gradient.opacity * 100)}%
          </span>
        </div>

        <div className="field-row">
          <label>Blend</label>
          <select
            className="blend-select"
            value={gradient.blendMode}
            onChange={(e) => setGradient({ blendMode: e.target.value })}
          >
            {BLEND_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layers list */}
      <div className="panel-section" style={{ flex: 1 }}>
        <div className="section-title">Layers</div>

        {reversedLayers.map((layer) => (
          <div
            key={layer.id}
            className={`layer-item${selectedId === layer.id ? ' selected' : ''}`}
            onClick={() => selectLayer(layer.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              selectLayer(layer.id);
              setCtxMenu({ x: e.clientX, y: e.clientY, layerId: layer.id });
            }}
          >
            <span className="layer-icon">
              {layer.type === 'sticker' ? '\u{1F3F7}' : 'T'}
            </span>
            <span className="layer-name">{layer.name}</span>
            <div className="layer-actions">
              <button
                title={layer.visible ? 'Hide' : 'Show'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
              >
                {layer.visible ? '\u{1F441}' : '\u2014'}
              </button>
              <button
                title="Move up"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(layer.id);
                }}
              >
                ^
              </button>
              <button
                title="Move down"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(layer.id);
                }}
              >
                v
              </button>
              <button
                title="Delete"
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
              >
                x
              </button>
            </div>
          </div>
        ))}

        {layers.length === 0 && (
          <div style={{ color: '#555', fontSize: 11, padding: '8px 0' }}>
            No layers yet. Add stickers or text.
          </div>
        )}

        {/* Fixed layers */}
        <div className="layer-fixed">
          <span className="layer-icon">G</span>
          <span>Gradient Overlay</span>
        </div>
        <div className="layer-fixed">
          <span className="layer-icon">B</span>
          <span>Background</span>
        </div>
      </div>

      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          className="ctx-menu"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              duplicateLayer(ctxMenu.layerId);
              setCtxMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              moveLayerUp(ctxMenu.layerId);
              setCtxMenu(null);
            }}
          >
            Move Up
          </button>
          <button
            onClick={() => {
              moveLayerDown(ctxMenu.layerId);
              setCtxMenu(null);
            }}
          >
            Move Down
          </button>
          <button
            onClick={() => {
              toggleLayerVisibility(ctxMenu.layerId);
              setCtxMenu(null);
            }}
          >
            Toggle Visibility
          </button>
          <div className="ctx-divider" />
          <button
            className="danger"
            onClick={() => {
              deleteLayer(ctxMenu.layerId);
              setCtxMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

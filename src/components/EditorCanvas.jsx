import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line } from 'react-konva';
import useImage from 'use-image';
import useStore, { CANVAS_WIDTH, CANVAS_HEIGHT } from '../store';
import StickerNode from './StickerNode';
import TextNode from './TextNode';

export default function EditorCanvas({ stageRef }) {
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  const layers = useStore((s) => s.layers);
  const selectedId = useStore((s) => s.selectedId);
  const gradient = useStore((s) => s.gradient);
  const selectLayer = useStore((s) => s.selectLayer);
  const updateLayer = useStore((s) => s.updateLayer);
  const addSticker = useStore((s) => s.addSticker);
  const duplicateLayer = useStore((s) => s.duplicateLayer);
  const deleteLayer = useStore((s) => s.deleteLayer);

  const [guides, setGuides] = useState({ snapH: false, snapV: false });

  // Ctrl+D to duplicate, Delete/Backspace to remove selected layer
  useEffect(() => {
    const onKeyDown = (e) => {
      const sel = useStore.getState().selectedId;
      if (!sel) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateLayer(sel);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        e.preventDefault();
        deleteLayer(sel);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [duplicateLayer, deleteLayer]);

  const [bgImage] = useImage('/assets/background/Background.png', 'anonymous');

  // Responsive scaling
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.offsetWidth - 48;
      const ch = containerRef.current.offsetHeight - 48;
      setScale(Math.min(cw / CANVAS_WIDTH, ch / CANVAS_HEIGHT, 1));
    };
    update();
    window.addEventListener('resize', update);
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', update);
      obs.disconnect();
    };
  }, []);

  // Attach transformer to selected node
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedId) {
      const node = stage.findOne('#' + selectedId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, layers, stageRef]);

  // Stage click — deselect or select
  const handleStageClick = useCallback(
    (e) => {
      if (e.target === e.target.getStage()) {
        selectLayer(null);
        return;
      }
      const id = e.target.id();
      if (id && layers.find((l) => l.id === id)) {
        selectLayer(id);
      }
    },
    [layers, selectLayer]
  );

  // Center-snap on drag (Shift disables)
  const SNAP_THRESHOLD = 15;
  const midX = CANVAS_WIDTH / 2;
  const midY = CANVAS_HEIGHT / 2;

  const handleDragMove = useCallback((e) => {
    const node = e.target;
    const w = node.width() * Math.abs(node.scaleX());
    const h = node.height() * Math.abs(node.scaleY());
    const nodeCX = node.x() + w / 2;
    const nodeCY = node.y() + h / 2;

    let snapH = false;
    let snapV = false;

    if (!e.evt.shiftKey) {
      if (Math.abs(nodeCX - midX) < SNAP_THRESHOLD) {
        node.x(midX - w / 2);
        snapH = true;
      }
      if (Math.abs(nodeCY - midY) < SNAP_THRESHOLD) {
        node.y(midY - h / 2);
        snapV = true;
      }
    }

    setGuides({ snapH, snapV });
  }, []);

  const clearGuides = useCallback(() => {
    setGuides({ snapH: false, snapV: false });
  }, []);

  // Drag-and-drop images onto canvas
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        addSticker(reader.result, file.name.replace(/\.[^.]+$/, ''));
      };
      reader.readAsDataURL(file);
    },
    [addSticker]
  );

  // Gradient geometry
  const rad = ((gradient.angle || 0) * Math.PI) / 180;
  const gLen = Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2) / 2;
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;
  const gradientStops = gradient.stops.flatMap((s) => [s.position, s.color]);

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH * scale}
        height={CANVAS_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        style={{
          borderRadius: '4px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        }}
      >
        <Layer>
          {/* Background image or fallback */}
          {bgImage ? (
            <KonvaImage
              image={bgImage}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              listening={false}
            />
          ) : (
            <Rect
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: CANVAS_WIDTH, y: CANVAS_HEIGHT }}
              fillLinearGradientColorStops={[0, '#1a1a2e', 0.5, '#16213e', 1, '#0f3460']}
              listening={false}
            />
          )}

          {/* Gradient overlay */}
          <Rect
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fillLinearGradientStartPoint={{
              x: cx - Math.cos(rad) * gLen,
              y: cy - Math.sin(rad) * gLen,
            }}
            fillLinearGradientEndPoint={{
              x: cx + Math.cos(rad) * gLen,
              y: cy + Math.sin(rad) * gLen,
            }}
            fillLinearGradientColorStops={gradientStops}
            opacity={gradient.opacity}
            globalCompositeOperation={gradient.blendMode}
            listening={false}
          />

          {/* Editable layers */}
          {layers.map((layer) => {
            if (layer.type === 'sticker') {
              return (
                <StickerNode
                  key={layer.id}
                  layer={layer}
                  onSelect={() => selectLayer(layer.id)}
                  onChange={(attrs) => updateLayer(layer.id, attrs)}
                  onDragMove={handleDragMove}
                  onSnapEnd={clearGuides}
                />
              );
            }
            if (layer.type === 'text') {
              return (
                <TextNode
                  key={layer.id}
                  layer={layer}
                  onSelect={() => selectLayer(layer.id)}
                  onChange={(attrs) => updateLayer(layer.id, attrs)}
                  onDragMove={handleDragMove}
                  onSnapEnd={clearGuides}
                />
              );
            }
            return null;
          })}

          {/* Snap guide lines */}
          {guides.snapH && (
            <Line
              points={[midX, 0, midX, CANVAS_HEIGHT]}
              stroke="#6366f1"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          )}
          {guides.snapV && (
            <Line
              points={[0, midY, CANVAS_WIDTH, midY]}
              stroke="#6366f1"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          )}

          {/* Selection transformer */}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]}
            borderStroke="#6366f1"
            anchorStroke="#6366f1"
            anchorFill="#1c1c2e"
            anchorSize={8}
            anchorCornerRadius={2}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}

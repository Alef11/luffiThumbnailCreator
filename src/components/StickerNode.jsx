import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';

export default function StickerNode({ layer, onSelect, onChange, onDragMove, onSnapEnd }) {
  const [image] = useImage(layer.src, 'anonymous');
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && image) {
      ref.current.cache();
      ref.current.getLayer()?.batchDraw();
    }
  }, [image, layer.hueRotation]);

  if (!image) return null;

  return (
    <KonvaImage
      ref={ref}
      id={layer.id}
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      visible={layer.visible}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        onSnapEnd?.();
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange({
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });
      }}
      filters={[Konva.Filters.HSL]}
      hue={layer.hueRotation || 0}
    />
  );
}

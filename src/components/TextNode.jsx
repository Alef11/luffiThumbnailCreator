import React from 'react';
import { Text } from 'react-konva';

export default function TextNode({ layer, onSelect, onChange, onDragMove, onSnapEnd }) {
  return (
    <Text
      id={layer.id}
      text={layer.text}
      x={layer.x}
      y={layer.y}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fill={layer.fill}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      letterSpacing={layer.letterSpacing || 0}
      align={layer.align || 'left'}
      fontStyle={layer.fontStyle || 'normal'}
      stroke={layer.strokeWidth > 0 ? layer.stroke : undefined}
      strokeWidth={layer.strokeWidth || 0}
      fillAfterStrokeEnabled
      shadowColor={layer.shadowColor}
      shadowBlur={layer.shadowEnabled ? layer.shadowBlur : 0}
      shadowOffsetX={layer.shadowEnabled ? layer.shadowOffsetX : 0}
      shadowOffsetY={layer.shadowEnabled ? layer.shadowOffsetY : 0}
      shadowEnabled={layer.shadowEnabled || false}
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
    />
  );
}

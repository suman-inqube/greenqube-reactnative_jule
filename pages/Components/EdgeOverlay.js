import React from 'react';
import {Svg, Rect} from 'react-native-svg';

export default function EdgeOverlay({edges}) {
  if (!edges) return null;

  return (
    <Svg style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
      <Rect
        x={edges.x}
        y={edges.y}
        width={edges.width}
        height={edges.height}
        stroke="#10b981"
        strokeWidth="3"
        fill="transparent"
      />
    </Svg>
  );
}

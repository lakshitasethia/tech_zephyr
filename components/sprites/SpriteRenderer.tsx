import React from "react";

export interface PixelColorMap {
  [char: string]: string;
}

interface SpriteRendererProps {
  grid: string[];
  colorMap: PixelColorMap;
  scale?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const SpriteRenderer: React.FC<SpriteRendererProps> = ({
  grid,
  colorMap,
  scale = 4,
  className = "",
  id,
  style = {},
  children,
}) => {
  const height = grid.length;
  const width = Math.max(...grid.map((row) => row.length));

  // Compute crisp integer dimensions
  const intScale = Math.max(1, Math.floor(scale));
  const svgWidth = width * intScale;
  const svgHeight = height * intScale;

  const rects: React.ReactNode[] = [];

  for (let r = 0; r < height; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char !== " " && char !== "." && colorMap[char]) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * intScale}
            y={r * intScale}
            width={intScale}
            height={intScale}
            fill={colorMap[char]}
          />
        );
      }
    }
  }

  return (
    <svg
      id={id}
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`pixel-crisp select-none ${className}`}
      style={{
        width: `${svgWidth}px`,
        height: `${svgHeight}px`,
        shapeRendering: "crispEdges",
        ...style,
      }}
      aria-hidden="true"
    >
      {rects}
      {children}
    </svg>
  );
};

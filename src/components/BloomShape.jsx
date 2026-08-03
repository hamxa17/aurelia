import React from 'react';

export default function BloomShape({ width = "100%", height = "100%", style, className }) {
  return (
    <svg viewBox="0 0 100 100" width={width} height={height} style={style} className={className}>
      <g fill="currentColor">
        <g>
          <ellipse cx="50" cy="26" rx="11" ry="22"/>
          <ellipse cx="50" cy="26" rx="11" ry="22" transform="rotate(60 50 50)"/>
          <ellipse cx="50" cy="26" rx="11" ry="22" transform="rotate(120 50 50)"/>
          <ellipse cx="50" cy="26" rx="11" ry="22" transform="rotate(180 50 50)"/>
          <ellipse cx="50" cy="26" rx="11" ry="22" transform="rotate(240 50 50)"/>
          <ellipse cx="50" cy="26" rx="11" ry="22" transform="rotate(300 50 50)"/>
        </g>
        <circle cx="50" cy="50" r="9" fill="var(--paper, #FFFDF9)"/>
      </g>
    </svg>
  );
}

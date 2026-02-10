"use client";

import React from 'react';
import { Range } from 'react-range';

type Props = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
};

export default function RangeSlider({ min, max, step = 1, value, onChange }: Props) {
  return (
    <div style={{ padding: '8px 0', width: '100%', maxWidth: '16rem' }}>
      <Range
        step={step}
        min={min}
        max={max}
        values={value}
        onChange={(vals) => onChange([vals[0], vals[1]])}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              height: '8px',
              display: 'flex',
              width: '100%',
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '8px',
                width: '100%',
                borderRadius: '6px',
                background: '#1f2937',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${((value[0] - min) / (max - min)) * 100}%`,
                  right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
                  height: '8px',
                  background: '#0095e8',
                  borderRadius: '6px',
                }}
              />
            </div>
            {children}
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '18px',
              width: '18px',
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #0095e8',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            aria-label={index === 0 ? 'Minimum duration' : 'Maximum duration'}
          />
        )}
      />
    </div>
  );
}

"use client";

import { Range } from "react-range";
import styles from "./RangeSlider.module.css";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onFinalChange?: (value: [number, number]) => void;
};

export default function RangeSlider({ min, max, step = 1, value, onChange, onFinalChange }: RangeSliderProps) {
  return (
    <div className={styles.container}>
      <Range
        step={step}
        min={min}
        max={max}
        values={value}
        onChange={(values) => onChange([values[0], values[1]])}
        onFinalChange={(values) => onFinalChange?.([values[0], values[1]])}
        renderTrack={({ props, children }) => (
          <div {...props} className={styles.trackWrapper}>
            <div ref={props.ref} className={styles.trackBase}>
              <div
                className={styles.trackSelected}
                style={{
                  left: `${((value[0] - min) / (max - min)) * 100}%`,
                  right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
                }}
              />
            </div>
            {children}
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            className={styles.thumb}
            style={{ ...props.style }}
            aria-label={index === 0 ? "Minimum duration" : "Maximum duration"}
          />
        )}
      />
    </div>
  );
}

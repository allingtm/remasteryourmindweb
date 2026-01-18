"use client";

import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  borderRadius?: string;
  containerClassName?: string;
  borderClassName?: string;
  className?: string;
  as?: React.ElementType;
}

export function MovingBorder({
  children,
  duration = 4000,
  borderRadius = "1.75rem",
  containerClassName,
  borderClassName,
  className,
  as: Component = "div",
}: MovingBorderProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden bg-transparent p-[1px]",
        containerClassName
      )}
      style={{
        borderRadius,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        <MovingBorderGradient duration={duration} borderRadius={borderRadius}>
          <div
            className={cn(
              "size-8 bg-[radial-gradient(var(--primary)_20%,transparent_80%)] opacity-30",
              borderClassName
            )}
          />
        </MovingBorderGradient>
      </div>

      <div
        className={cn(
          "relative z-10 border border-border/50 bg-background backdrop-blur-xl",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}

interface MovingBorderGradientProps {
  children: React.ReactNode;
  duration?: number;
  borderRadius?: string;
}

function MovingBorderGradient({
  children,
  duration = 4000,
  borderRadius = "1.75rem",
}: MovingBorderGradientProps) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMs = length / duration;
      progress.set((time * pxPerMs) % length);
    }
  });

  const x = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val);
    return point?.x ?? 0;
  });

  const y = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val);
    return point?.y ?? 0;
  });

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute size-full"
        width="100%"
        height="100%"
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={borderRadius}
          ry={borderRadius}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
}

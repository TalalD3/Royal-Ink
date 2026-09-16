"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

export const RippleBackground = React.memo(function RippleBackground({
  mainCircleSize = 150,
  mainCircleOpacity = 0.2,
  numCircles = 8,
  className,
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className,
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 140;
        const opacity = Math.max(0, mainCircleOpacity - i * 0.02);
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, opacity, 0],
              scale: [0.8, 1, 1.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
            className="absolute rounded-full border border-primary/20 bg-primary/[0.02]"
            style={{
              width: size,
              height: size,
            }}
          />
        );
      })}
    </div>
  );
});

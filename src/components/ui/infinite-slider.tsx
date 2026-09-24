'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  /** Speed in pixels per second. When provided, automatically guarantees equal visual speed across all sliders regardless of item count or width. */
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  speed,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let controls;
    const size = direction === 'horizontal' ? width : height;
    if (!size) return;
    const contentSize = size + gap;
    const halfDistance = contentSize / 2;

    // Calculate effective duration: if speed (px/sec) is specified, duration = distance / speed
    const activeSpeed = currentSpeed ?? speed;
    const effectiveDuration = activeSpeed
      ? halfDistance / activeSpeed
      : currentDuration;

    const from = reverse ? -halfDistance : 0;
    const to = reverse ? 0 : -halfDistance;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration:
          effectiveDuration * Math.abs((translation.get() - to) / halfDistance),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: effectiveDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [
    key,
    translation,
    currentDuration,
    currentSpeed,
    speed,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps =
    durationOnHover || speedOnHover
      ? {
          onHoverStart: () => {
            setIsTransitioning(true);
            if (speedOnHover) {
              setCurrentSpeed(speedOnHover);
            }
            if (durationOnHover) {
              setCurrentDuration(durationOnHover);
            }
          },
          onHoverEnd: () => {
            setIsTransitioning(true);
            if (speed) {
              setCurrentSpeed(speed);
            }
            if (duration) {
              setCurrentDuration(duration);
            }
          },
        }
      : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export default InfiniteSlider;

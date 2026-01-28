'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  formatFn = (v) => Math.round(v).toLocaleString(),
}: AnimatedCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => formatFn(current));

  useEffect(() => {
    if (!hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    } else {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

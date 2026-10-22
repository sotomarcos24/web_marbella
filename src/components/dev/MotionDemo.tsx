"use client";

import { MotionConfig, motion, stagger, type Variants } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const list: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.15) } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

const arches = ["bg-arena", "bg-oliva/60", "bg-mar/70"];

// Tarjetas con máscara de arco que entran escalonadas (docs/vision.md §2.6). Con
// prefers-reduced-motion, MotionConfig quita el desplazamiento y deja solo el fundido.
export function MotionDemo({ rooms, replayLabel }: { rooms: string[]; replayLabel: string }) {
  const [run, setRun] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <motion.ul key={run} className="grid grid-cols-3 gap-4 sm:gap-8" variants={list} initial="hidden" animate="visible">
        {rooms.map((room, index) => (
          <motion.li key={room} variants={card} className="flex flex-col gap-3">
            <div className={cn("aspect-[3/4] rounded-t-full", arches[index % arches.length])} />
            <span className="font-display text-xl">{room}</span>
          </motion.li>
        ))}
      </motion.ul>
      <Button variant="secondary" className="mt-8" onClick={() => setRun((value) => value + 1)}>
        {replayLabel}
      </Button>
    </MotionConfig>
  );
}

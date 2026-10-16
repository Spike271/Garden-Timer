import { useEffect, useRef } from 'react';
import { drawScene } from '../canvas/drawPlant';

const POP_MS = 900;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// The rAF loop lives in refs and draws imperatively. No setState per frame.
export function useGardenCanvas(canvasRef, plants) {
  const plantsRef = useRef(plants);
  const wiltsRef = useRef([]);
  const popRef = useRef({ stage: plants[plants.length - 1].stage, startedAt: -Infinity });

  useEffect(() => {
    plantsRef.current = plants;
    const last = plants[plants.length - 1];
    // Only a stage increase triggers the pop. Wilts and new seeds don't.
    const startedAt =
      last.stage > popRef.current.stage ? performance.now() : popRef.current.startedAt;
    popRef.current = { stage: last.stage, startedAt };
  }, [plants]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const loop = (t) => {
      const list = plantsRef.current;

      // Ease each plant's wilt toward its target.
      list.forEach((p, i) => {
        const target = p.wilted ? 1 : 0;
        const cur = wiltsRef.current[i] ?? target;
        wiltsRef.current[i] = cur + (target - cur) * 0.08;
      });
      wiltsRef.current.length = list.length;

      const k = Math.min(1, (performance.now() - popRef.current.startedAt) / POP_MS);
      const popScale = 0.6 + 0.4 * easeOutCubic(k);

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const now = new Date();
      drawScene(ctx, {
        width: w,
        height: h,
        plants: list,
        wilts: wiltsRef.current,
        popScale,
        timeMs: t,
        hour: now.getHours() + now.getMinutes() / 60,
      });

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame); // prevents loop leaks on unmount / StrictMode
  }, [canvasRef]);
}

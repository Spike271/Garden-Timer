import {useEffect, useRef} from 'react';
import {drawPlant} from '../canvas/drawPlant';

// The rAF loop lives in refs and draws imperatively. No setState per frame.
export function usePlantAnimation(canvasRef, plant) {
    const plantRef = useRef(plant);

    useEffect(() => {
        plantRef.current = plant;
    }, [plant]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let wilt = plantRef.current.wilted ? 1 : 0;
        let frame = 0;

        const loop = () => {
            const {stage, wilted} = plantRef.current;
            wilt += ((wilted ? 1 : 0) - wilt) * 0.08; // ease toward target

            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                canvas.width = w * dpr;
                canvas.height = h * dpr;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawPlant(ctx, {width: w, height: h, stage, wiltAmount: wilt});

            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame); // prevents loop leaks on unmount / StrictMode
    }, [canvasRef]);
}

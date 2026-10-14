import {useRef} from 'react';
import {useGardenCanvas} from '../hooks/useGardenCanvas';
import {useGarden} from '../state/GardenContext';
import {APP_STRINGS} from '../config';

export default function PlantCanvas() {
    const canvasRef = useRef(null);
    const {plants} = useGarden();
    useGardenCanvas(canvasRef, plants);
    return (
        <canvas
            ref={canvasRef}
            className="plant-canvas"
            aria-label={APP_STRINGS.SPECIMEN.CANVAS_ARIA_LABEL}
        />
    );
}

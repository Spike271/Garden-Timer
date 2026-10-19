import { useRef } from 'react';
import { useGardenCanvas } from '../hooks/useGardenCanvas';
import { useGarden } from '../state/GardenContext';
import { APP_STRINGS } from '../config';
import { describeGarden } from '../state/gardenDescription';

export default function PlantCanvas() {
  const canvasRef = useRef(null);
  const { plants } = useGarden();
  useGardenCanvas(canvasRef, plants);
  // Canvas pixels are invisible to assistive tech, so expose the garden state as an image label.
  const a11y = { role: 'img', 'aria-label': describeGarden(plants, APP_STRINGS.SPECIMEN) };
  return <canvas ref={canvasRef} className="plant-canvas" {...a11y} />;
}

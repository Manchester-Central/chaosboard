import { create } from 'domain';
import { useEffect, useRef } from 'react';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

const pixelsPerMeter = 400;
const metersForDisplay = 5;
const pixelsForDisplay = pixelsPerMeter * metersForDisplay;
const metersToPixels = (meters: number) =>  Math.floor(meters * pixelsPerMeter);
const getXCoordinate = (meters: number, widthPixels: number = 0) =>  metersToPixels(meters) + (pixelsForDisplay / 2) - (widthPixels / 2); // Center the x coordinate
const getYCoordinate = (meters: number, heightPixels: number = 0) =>  pixelsForDisplay - metersToPixels(meters) - heightPixels; // base the y on the bottom of the shape

class Coordinate {
  constructor(public x: number, public y: number) {

  }

  static fromMeters(xMeters: number, yMeters: number, widthPixels: number = 0, heightPixels: number = 0): Coordinate {
    return new Coordinate(getXCoordinate(xMeters, widthPixels), getYCoordinate(yMeters, heightPixels));
  }
}

interface Shape {
  widthMeters: number,
  heightMeters: number
  xMeters: number,
  yMeters: number
  widthPixels: number,
  heightPixels: number,
  coordinate: Coordinate,
  color: string,
}

type ArmDisplayProps = {
  entry: NTEntry | undefined,
};
export function ArmDisplay({ entry }: ArmDisplayProps) {

  let createShape = (widthMeters: number, heightMeters: number, xMeters: number, yMeters: number, color: string) => {
    const heightPixels = metersToPixels(heightMeters);
    const widthPixels = metersToPixels(widthMeters);
    const shape: Shape = {
      widthMeters,
      heightMeters,
      xMeters,
      yMeters,
      widthPixels,
      heightPixels,
      coordinate: Coordinate.fromMeters(xMeters, yMeters, widthPixels, heightPixels),
      color,
    } 
    return shape;
  };

  let drawRectangle = (context: CanvasRenderingContext2D, shape: Shape) => {
    context.fillStyle = shape.color;
    context.beginPath();
    context.rect(shape.coordinate.x, shape.coordinate.y, shape.widthPixels, shape.heightPixels);
    context.fill();
  }

  let drawRoundRectangle = (context: CanvasRenderingContext2D, shape: Shape, radiusPixels: number) => {
    context.fillStyle = shape.color;
    context.beginPath();
    context.roundRect(shape.coordinate.x, shape.coordinate.y, shape.widthPixels, shape.heightPixels, radiusPixels);
    context.fill();
  }

  let drawLine = (context: CanvasRenderingContext2D, start: Coordinate, angleDegrees: number, lengthMeters: number, color: string, width: number) => {
    const startXPixel = start.x;
    const startYPixel = start.y;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(startXPixel, startYPixel);
    let angleRadians = angleDegrees * Math.PI / 180;
    let endX = startXPixel + metersToPixels(lengthMeters) * Math.cos(angleRadians);
    let endY =  startYPixel - metersToPixels(lengthMeters) * Math.sin(angleRadians);
    context.lineTo(endX, endY);
    context.stroke();
    return new Coordinate(endX, endY);
  }

  let value = useNtEntry(entry);

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draw = (context: CanvasRenderingContext2D, frameCount: number) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const unsafeColor = frameCount % 100 > 50 ? '#aa000055' : '#aa111177';
    const unsafeZone = createShape(0.4, 0.130, 0, 0.1, unsafeColor);
    const shoulderPivotDiamterMeters = 0.2;
    const shoulderPivot = createShape(shoulderPivotDiamterMeters, shoulderPivotDiamterMeters, 0, 1.12, 'lightgray');
    const mast = createShape(0.051, 1.39, 0, 0.1, 'forestgreen');
    const wheelDiameterMeters = 0.102;
    const wheelLeft = createShape(wheelDiameterMeters, wheelDiameterMeters, -0.27, 0.0, 'blue');
    const wheelRight = createShape(wheelDiameterMeters, wheelDiameterMeters, 0.27, 0.0, 'blue');
    const bumpers = createShape(0.863, 0.129, 0, 0.047, 'forestgreen');
    const middleCubeNode = createShape(0.60, 0.46, -1.61, 0, 'indigo');
    const middleCubeNodeShelf = createShape(0.60, 0.073, -1.61, 0.38,'pink');
    const topCubeNode = createShape(0.60, 0.90, -2.21, 0, 'darkviolet')
    const topCubeNodeShelf = createShape(0.60, 0.073, -2.21, 0.82,'pink');
    const frontPole = createShape(0.078, 0.87, 1.61 , 0, 'salmon');
    const backPole = createShape(0.078, 1.17, 2.21 , 0, 'darksalmon');

    let shoulderAngleDegrees = value?.[0] ?? 0;
    let extenderLengthMeters = value?.[1] ?? 1;
    const extenderStart = Coordinate.fromMeters(0, shoulderPivot.yMeters + (shoulderPivot.heightMeters / 2));
    const extenderEndpoint = drawLine(context, extenderStart,  shoulderAngleDegrees, extenderLengthMeters, 'orange', 25);

    let gripperPower = value?.[3] ?? 0;
    let gripperColor = 'gray';
    if (gripperPower > 0) {
      gripperColor = '#134122';
    }
    if (gripperPower < 0) {
      gripperColor = '#F26722';
    }

    let wristAngleDegrees = value?.[2] ?? 0;
    wristAngleDegrees += shoulderAngleDegrees;
    let wristLengthMeters = 0.30;
    const wristEndpoint = drawLine(context, extenderEndpoint, wristAngleDegrees, wristLengthMeters, gripperColor, 25);

    drawRoundRectangle(context, unsafeZone, 10);
    drawRoundRectangle(context, shoulderPivot, shoulderPivot.heightPixels / 2);
    drawRectangle(context, mast);
    drawRoundRectangle(context, wheelLeft, wheelLeft.heightPixels / 2);
    drawRoundRectangle(context, wheelRight, wheelRight.heightPixels / 2);
    drawRoundRectangle(context, bumpers, bumpers.heightPixels / 3);
    drawRectangle(context, middleCubeNode);
    drawRectangle(context, middleCubeNodeShelf);
    drawRectangle(context, topCubeNode);
    drawRectangle(context, topCubeNodeShelf);
    drawRectangle(context, frontPole);
    drawRectangle(context, backPole);
  };

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    let frameCount = 0;
    let animationFrameId: number;
    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value]);


  return (
    <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
      <canvas width={pixelsForDisplay} height={pixelsForDisplay} style={{ width: '100%', height: '100%', border: '1px solid black' }} ref={canvasRef}></canvas>
      {value?.join(", ")}
    </div>
  );

}
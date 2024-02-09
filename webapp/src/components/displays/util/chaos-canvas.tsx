import { useEffect, useRef } from 'react';
import { NTEntry } from '../../../data/nt-manager';
import useNtEntry from '../../../hooks/useNtEntry';

const pixelsPerMeter = 500;
const metersForDisplay = 4;
const pixelsForDisplay = pixelsPerMeter * metersForDisplay;
export const metersToPixels = (meters: number) => Math.floor(meters * pixelsPerMeter);
export const getXCoordinate = (meters: number, widthPixels: number = 0) => metersToPixels(meters) + (pixelsForDisplay / 2) - (widthPixels / 2); // Center the x coordinate
export const getYCoordinate = (meters: number, heightPixels: number = 0) => pixelsForDisplay - metersToPixels(meters) - heightPixels; // base the y on the bottom of the shape

export const createShape = (widthMeters: number, heightMeters: number, xMeters: number, yMeters: number, color: string) => {
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

export const drawRectangle = (context: CanvasRenderingContext2D, shape: Shape) => {
    context.fillStyle = shape.color;
    context.beginPath();
    context.rect(shape.coordinate.x, shape.coordinate.y, shape.widthPixels, shape.heightPixels);
    context.fill();
}

export const drawRoundRectangle = (context: CanvasRenderingContext2D, shape: Shape, radiusPixels: number) => {
    context.fillStyle = shape.color;
    context.beginPath();
    context.roundRect(shape.coordinate.x, shape.coordinate.y, shape.widthPixels, shape.heightPixels, radiusPixels);
    context.fill();
}

export const drawLine = (context: CanvasRenderingContext2D, start: Coordinate, angleDegrees: number, lengthMeters: number, color: string, width: number) => {
    const startXPixel = start.x;
    const startYPixel = start.y;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(startXPixel, startYPixel);
    let angleRadians = angleDegrees * Math.PI / 180;
    let endX = startXPixel + metersToPixels(lengthMeters) * Math.cos(angleRadians);
    let endY = startYPixel - metersToPixels(lengthMeters) * Math.sin(angleRadians);
    context.lineTo(endX, endY);
    context.stroke();
    return new Coordinate(endX, endY);
}

export class Coordinate {
    constructor(public x: number, public y: number) {

    }

    static fromMeters(xMeters: number, yMeters: number, widthPixels: number = 0, heightPixels: number = 0): Coordinate {
        return new Coordinate(getXCoordinate(xMeters, widthPixels), getYCoordinate(yMeters, heightPixels));
    }
}

export interface Shape {
    widthMeters: number,
    heightMeters: number
    xMeters: number,
    yMeters: number
    widthPixels: number,
    heightPixels: number,
    coordinate: Coordinate,
    color: string,
}

type ChaosCanvasProps = {
    entry: NTEntry | undefined,
    draw: (context: CanvasRenderingContext2D, ntValue: any, frameCount: number) => void
};
/**
 * Creates an Arm Display for CHAOS's 2023 robot.
 * The physical arm was dismantled, so this remains mostly for reference.
 */
export function ChaosCanvas({ entry, draw }: ChaosCanvasProps) {

    let [value] = useNtEntry(entry);

    const canvasRef = useRef<HTMLCanvasElement>(null)

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
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            draw(context, value, frameCount);
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
        </div>
    );

}
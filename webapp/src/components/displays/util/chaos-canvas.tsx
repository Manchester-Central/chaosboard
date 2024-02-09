import { useEffect, useRef, useState } from 'react';
import { NTEntry } from '../../../data/nt-manager';
import useNtEntry from '../../../hooks/useNtEntry';

export class CanvasHelper {
    public readonly pixelsForDisplay: number;

    constructor(public readonly metersForDisplay = 4, public readonly pixelsPerMeter = 500, ) {
        this.pixelsForDisplay = pixelsPerMeter * metersForDisplay;
    }

    metersToPixels = (meters: number) => Math.floor(meters * this.pixelsPerMeter);
    getXCoordinate = (meters: number, widthPixels: number = 0) => this.metersToPixels(meters) + (this.pixelsForDisplay / 2) - (widthPixels / 2); // Center the x coordinate
    getYCoordinate = (meters: number, heightPixels: number = 0) => this.pixelsForDisplay - this.metersToPixels(meters) - heightPixels; // base the y on the bottom of the shape

    createShape = (widthMeters: number, heightMeters: number, xMeters: number, yMeters: number, color: string) => {
        const heightPixels = this.metersToPixels(heightMeters);
        const widthPixels = this.metersToPixels(widthMeters);
        const shape: Shape = {
            widthMeters,
            heightMeters,
            xMeters,
            yMeters,
            widthPixels,
            heightPixels,
            coordinate: this.getCoordinateFromMeters(xMeters, yMeters, widthPixels, heightPixels),
            color,
        }
        return shape;
    };
    
    drawRectangle = (context: CanvasRenderingContext2D, shape: Shape) => {
        context.fillStyle = shape.color;
        context.beginPath();
        context.rect(shape.coordinate.xPixels, shape.coordinate.yPixels, shape.widthPixels, shape.heightPixels);
        context.fill();
    }
    
    drawRoundRectangle = (context: CanvasRenderingContext2D, shape: Shape, radiusPixels: number) => {
        context.fillStyle = shape.color;
        context.beginPath();
        context.roundRect(shape.coordinate.xPixels, shape.coordinate.yPixels, shape.widthPixels, shape.heightPixels, radiusPixels);
        context.fill();
    }
    
    drawLine = (context: CanvasRenderingContext2D, start: Coordinate, angleDegrees: number, lengthMeters: number, color: string, width: number) => {
        const startXPixel = start.xPixels;
        const startYPixel = start.yPixels;
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(startXPixel, startYPixel);
        let angleRadians = angleDegrees * Math.PI / 180;
        let endX = startXPixel + this.metersToPixels(lengthMeters) * Math.cos(angleRadians);
        let endY = startYPixel - this.metersToPixels(lengthMeters) * Math.sin(angleRadians);
        context.lineTo(endX, endY);
        context.stroke();
        return new Coordinate(endX, endY);
    }

    getCoordinateFromMeters(xMeters: number, yMeters: number, widthPixels: number = 0, heightPixels: number = 0): Coordinate {
        return new Coordinate(this.getXCoordinate(xMeters, widthPixels), this.getYCoordinate(yMeters, heightPixels));
    }
}

export class Coordinate {
    constructor(public xPixels: number, public yPixels: number) {

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
    canvasHelper: CanvasHelper,
    draw: <T extends (any | undefined)[]>(context: CanvasRenderingContext2D, ntValue: T, frameCount: number) => void
};
/**
 * Creates an Arm Display for CHAOS's 2023 robot.
 * The physical arm was dismantled, so this remains mostly for reference.
 */
export function ChaosCanvas({ entry, canvasHelper, draw }: ChaosCanvasProps) {

    const [value] = useNtEntry(entry);
    const [errorMessage, setErrorMessage] = useState<string>();

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const showGrid = (context: CanvasRenderingContext2D) => {
        const gridColor = '#80808029';
        canvasHelper.drawLine(context, canvasHelper.getCoordinateFromMeters(0, 0), 90, canvasHelper.metersForDisplay, gridColor, 5);
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
            if (Array.isArray(value)) {
                setErrorMessage(undefined);
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                showGrid(context);
                draw(context, value, frameCount);
            } else {
                setErrorMessage(`${entry?.title} is not an array and can't be used with the canvas tool.`);
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [value]);

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            {!!errorMessage ? <h1>{errorMessage}</h1> : <></>}
            <canvas width={canvasHelper.pixelsForDisplay} height={canvasHelper.pixelsForDisplay} style={{ width: '100%', height: '100%', border: '1px solid black' }} ref={canvasRef}></canvas>
        </div>
    );

}
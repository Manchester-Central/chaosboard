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

    pixelsToMeters = (pixels: number) => pixels / this.pixelsPerMeter;
    getXMeters = (pixels: number) => this.pixelsToMeters(pixels - (this.pixelsForDisplay / 2));
    getYMeters= (pixels: number) => this.pixelsToMeters(this.pixelsForDisplay - pixels);

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

    addTextToShape = (context: CanvasRenderingContext2D, shape: Shape, text: string, color: string, fontSize: number) => {
        context.beginPath();
        context.font = `${fontSize}px Arial`;
        context.fillStyle = color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, shape.coordinate.xPixels + (shape.widthPixels / 2), shape.coordinate.yPixels + (shape.heightPixels / 2));
    }

    addTextAtPoint = (context: CanvasRenderingContext2D, coordinate: Coordinate, text: string, color: string, fontSize: number) => {
        context.beginPath();
        context.font = `${fontSize}px Arial`;
        context.fillStyle = color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, coordinate.xPixels, coordinate.yPixels);
    }
    
    drawLine = (context: CanvasRenderingContext2D, start: Coordinate, angleDegrees: number, lengthMeters: number, color: string, widthPixels: number) => {
        const startXPixel = start.xPixels;
        const startYPixel = start.yPixels;
        context.strokeStyle = color;
        context.lineWidth = widthPixels;
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

    getMetersFromCoordinate(coordinate: Coordinate) {
        return {
            xMeters: this.getXMeters(coordinate.xPixels),
            yMeters: this.getYMeters(coordinate.yPixels),
        }
    }
}

export class Coordinate {
    constructor(public xPixels: number, public yPixels: number) {

    }

    plusMeters(ch: CanvasHelper, xMeters: number, yMeters: number) {
        return new Coordinate(this.xPixels + ch.metersToPixels(xMeters), this.yPixels - ch.metersToPixels(yMeters));
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
            const valueAsArray = Array.isArray(value) ? value : [value];
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            showGrid(context);
            draw(context, valueAsArray, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [value]);

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <canvas width={canvasHelper.pixelsForDisplay} height={canvasHelper.pixelsForDisplay} style={{ width: '100%', height: '100%', border: '1px solid black' }} ref={canvasRef}></canvas>
        </div>
    );

}
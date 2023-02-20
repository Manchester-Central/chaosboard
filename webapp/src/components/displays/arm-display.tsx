import { useEffect, useRef } from 'react';
import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type ArmDisplayProps = {
    entry: NTEntry | undefined,
};
export function ArmDisplay({ entry }: ArmDisplayProps) {

    let value = useNtEntry(entry);

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const draw = (context: CanvasRenderingContext2D, frameCount: number) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        console.log(context.canvas.height, context.canvas.width);
        
        context.fillStyle = 'hotpink';
        context.beginPath();
       context.rect(185,200,30,200);
        context.fill();

        context.fillStyle = 'black';
        context.beginPath();
        context.rect(157, 340, 86.3, 60);
        context.fill();

        context.strokeStyle = 'green';
        context.lineWidth = 25
        context.beginPath();
        context.moveTo(200,200)
        let shoulderAngle = value?.[0] ?? 0;
        let shoulderAngleRadians = shoulderAngle * Math.PI/180;
        let extenderLength = value?.[1]*100 ?? 100;
        let extenderX = 200 + extenderLength * Math.cos(shoulderAngleRadians);
        let extenderY = 200 - extenderLength * Math.sin(shoulderAngleRadians);
        context.lineTo(extenderX, extenderY) 
        context.stroke();

        context.strokeStyle = 'blue';
        context.lineWidth = 25
        context.beginPath();
        context.moveTo(extenderX, extenderY)
        let wristLength = 30
        let angleWrist = value?.[2] ?? 0;
        angleWrist += shoulderAngle + 25
        let angleWristRadians = angleWrist * Math.PI/180;
        let wristX = extenderX + wristLength * Math.cos(angleWristRadians)
        let wristY = extenderY - wristLength * Math.sin(angleWristRadians)
        context.lineTo(wristX , wristY) 
        context.stroke();
      };

      useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return;
       }
        const context = canvas.getContext('2d');
        if (!context){
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
            <canvas width="400" height="400" style={{ width: '100%', height: '100%',border:'1px solid black' }} ref={canvasRef}></canvas>
            
        </div>
    );

}
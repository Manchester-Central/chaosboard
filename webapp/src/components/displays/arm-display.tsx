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
       // context.arc(170, 50, 30 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
       context.rect(185,200,30,200)
        context.fill();

        context.strokeStyle = 'green';
        context.lineWidth = 25
        context.beginPath();
        context.moveTo(200,200)
        context.lineTo(300,200) 
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
      }, []);

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <canvas width="400" height="400" style={{ width: '100%', height: '100%',border:'1px solid black' }} ref={canvasRef}></canvas>
            
        </div>
    );

}
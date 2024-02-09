import { useState } from 'react';
import { NTEntry } from './../../data/nt-manager';
import {
  ChaosCanvas,
  CanvasHelper,
} from './util/chaos-canvas';

type ArmDisplayProps = {
  entry: NTEntry | undefined,
};
/**
 * Creates an Arm Display for CHAOS's 2023 robot.
 * The physical arm was dismantled, so this remains mostly for reference.
 */
export function RobotDisplay2024({ entry }: ArmDisplayProps) {
  const [ch] = useState(new CanvasHelper(3));

  const draw = (context: CanvasRenderingContext2D, [_]: (number | undefined)[], frameCount: number) => {
    // wheels
    const wheelDiameterMeters = 0.102;
    const wheelLeft = ch.createShape(wheelDiameterMeters, wheelDiameterMeters, -0.27, 0.0, 'black');
    const wheelRight = ch.createShape(wheelDiameterMeters, wheelDiameterMeters, 0.27, 0.0, 'black');
    ch.drawRoundRectangle(context, wheelLeft, wheelLeft.heightPixels / 2);
    ch.drawRoundRectangle(context, wheelRight, wheelRight.heightPixels / 2);

    // base plate
    const basePlateWidth = 0.685800;
    const basePlateheight = 0.1;
    const basePlateHeightOffGround = 0.009525;
    const basePlate = ch.createShape(basePlateWidth, basePlateheight, 0, basePlateHeightOffGround, 'silver');
    ch.drawRoundRectangle(context, basePlate, basePlate.heightPixels / 3);

    // bumpers
    const bumbersWidth = 0.990092;
    const bumbersHeight = 0.129032;
    const bumperHeightOffGround = 0.057150;
    const bumpersOffset = 0.539496 - (0.990092 / 2);
    const bumpers = ch.createShape(bumbersWidth, bumbersHeight, bumpersOffset, bumperHeightOffGround, 'forestgreen');
    ch.drawRoundRectangle(context, bumpers, bumpers.heightPixels / 3);
    ch.addTextToShape(context, bumpers, '131', 'white', 50);
  };

  return (
    <ChaosCanvas entry={entry} canvasHelper={ch} draw={draw}/>
  );

}
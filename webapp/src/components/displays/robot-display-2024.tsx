import { useState } from 'react';
import { NTEntry } from './../../data/nt-manager';
import {
  ChaosCanvas,
  CanvasHelper,
  Coordinate,
} from './util/chaos-canvas';

const chaosGreen = '#134122';
const chaosAltGreen = '#9fc7ad';
const chaosOrange = '#ff6700';
const chaosGreenTransparent = chaosGreen + 'ee';
const chaosOrangeTransparent = chaosOrange + '77';

const getDirectionColor = (power: number, frameCount: number) => {
  if (frameCount % 50 > 40) {
    return '#80808022'
  }
  if (power === 0) {
    return '#80808055';
  }
  const opacity = (Math.abs(power / 1) / 2) + 0.25;
  if (power > 0) {
    return `rgba(0, 255, 0, ${opacity})`;
  } else {
    return `rgba(255, 100, 0, ${opacity})`;
  }
}

type ArmDisplayProps = {
  entry: NTEntry | undefined,
};
/**
 * Creates an Arm Display for CHAOS's 2023 robot.
 * The physical arm was dismantled, so this remains mostly for reference.
 */
export function RobotDisplay2024({ entry }: ArmDisplayProps) {
  const [ch] = useState(new CanvasHelper(1.5));

  const draw = (context: CanvasRenderingContext2D, [intakePower, liftHeightMeters, launcherAngleDegrees, feederPower, launcherPower]: (number | undefined)[], frameCount: number) => {
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

    // Lift Height
    liftHeightMeters = liftHeightMeters ?? 0.35;
    const liftWidth = 0.050800;
    const liftAngleDegrees = 80;
    const liftEnd = ch.drawLine(context, ch.getCoordinateFromMeters(-0.096682, 0.071550), liftAngleDegrees, liftHeightMeters, chaosAltGreen, ch.metersToPixels(liftWidth));

    // lift platform
    const liftPlatformAngleDegrees = -11.826423;
    const platformLength = 0.340474;
    const platformWidth = 0.02;
    const platformEnd = ch.drawLine(context, liftEnd, liftPlatformAngleDegrees, platformLength, 'silver', ch.metersToPixels(platformWidth));

    // launcher
    const launcherAngleDegreesConverted = 180 - (launcherAngleDegrees ?? 0);
    const launcherLength = 0.333747;
    const launcherWidth = 0.1;
    const launcherColor = getDirectionColor(launcherPower ?? 0, frameCount);
    ch.drawLine(context, platformEnd, launcherAngleDegreesConverted, launcherLength, launcherColor, ch.metersToPixels(launcherWidth));

    // feeder
    const feederAngle = launcherAngleDegreesConverted - 200;
    const feederLength = 0.05;
    const feederWidth = 0.1;
    const feederColor = getDirectionColor(feederPower ?? 0, frameCount);
    ch.drawLine(context, platformEnd, feederAngle, feederLength, feederColor, ch.metersToPixels(feederWidth));

    // static lift beam
    const beamLength = 0.547852;
    const beamWidth = 0.050800;
    ch.drawLine(context, ch.getCoordinateFromMeters(-0.096682, 0.071550), liftAngleDegrees, beamLength, chaosGreen, ch.metersToPixels(beamWidth));

    // static lift brace
    const braceLength = 0.446015;
    const braceWidth = 0.025400;
    const braceAngleDegrees = 49.157005;
    ch.drawLine(context, ch.getCoordinateFromMeters(-0.308817, 0.180586), braceAngleDegrees, braceLength, chaosGreen, ch.metersToPixels(braceWidth));

    // intake
    const intakeLength = 0.3;
    const intakeWidth = 0.072599;
    const intakeAngleDegrees = 110;
    const intakeColor = getDirectionColor(intakePower ?? 0, frameCount);
    ch.drawLine(context, ch.getCoordinateFromMeters(0.432365, 0.031797), intakeAngleDegrees, intakeLength, intakeColor, ch.metersToPixels(intakeWidth));

    // bumpers
    const bumbersWidth = 0.990092;
    const bumbersHeight = 0.129032;
    const bumperHeightOffGround = 0.057150;
    const bumpersOffset = 0.539496 - (0.990092 / 2);
    const bumpers = ch.createShape(bumbersWidth, bumbersHeight, bumpersOffset, bumperHeightOffGround, chaosGreenTransparent);
    ch.drawRoundRectangle(context, bumpers, bumpers.heightPixels / 3);
    ch.addTextToShape(context, bumpers, '131', 'white', 50);
  };

  return (
    <ChaosCanvas entry={entry} canvasHelper={ch} draw={draw}/>
  );

}
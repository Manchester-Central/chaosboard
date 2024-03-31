import { useState } from 'react';
import { NTEntry } from './../../data/nt-manager';
import {
  ChaosCanvas,
  CanvasHelper,
  Coordinate,
} from './util/chaos-canvas';
import { withSigFigs } from './util/num-utils';

const chaosGreen = '#134122';
const chaosAltGreen = '#9fc7ad';
const chaosOrange = '#ff6700';
const chaosGreenTransparent = chaosGreen + 'ee';
const chaosOrangeTransparent = chaosOrange + '77';
const transparent = '#00000000';

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

  const draw = (context: CanvasRenderingContext2D, [intakePower, liftHeightMeters, launcherAngleDegrees, feederPower, launcherRpm, feederAtPrimaryDbl, feederAtSecondaryDbl, feederAtTertiaryDbl, feederAtIntakeDbl]: (number | undefined)[], frameCount: number) => {
    const isFeederAtPrimary = !!feederAtPrimaryDbl;
    const isFeederAtSecondary = !!feederAtSecondaryDbl;

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
    const adjustedliftHeightMeters = (liftHeightMeters ?? 0.05) + 0.35;
    const liftWidth = 0.050800;
    const liftAngleDegrees = 80;
    const liftEnd = ch.drawLine(context, ch.getCoordinateFromMeters(-0.091682, 0.071550), liftAngleDegrees, adjustedliftHeightMeters, chaosAltGreen, ch.metersToPixels(liftWidth));

    ch.addTextAtPoint(context, liftEnd.plusMeters(ch, -0.3, 0), `${withSigFigs(liftHeightMeters ?? 0, 2)} m`, 'black', 30);

    // lift platform
    const liftPlatformAngleDegrees = -11.826423;
    const platformLength = 0.340474;
    const platformWidth = 0.02;
    const platformEnd = ch.drawLine(context, liftEnd, liftPlatformAngleDegrees, platformLength, 'silver', ch.metersToPixels(platformWidth));

    ch.addTextAtPoint(context, platformEnd.plusMeters(ch, 0.15, 0), `${withSigFigs(launcherAngleDegrees ?? 0, 3)}°`, 'black', 30);

    // launcher
    const launcherAngleDegreesConverted = 180 - (launcherAngleDegrees ?? 0);
    const launcherLength = 0.333747;
    const launcherWidth = 0.1;
    const launcherColor = getDirectionColor((launcherRpm ?? 0) / 4000, frameCount);
    const launcherEnd = ch.drawLine(context, platformEnd, launcherAngleDegreesConverted, launcherLength, launcherColor, ch.metersToPixels(launcherWidth));

    ch.addTextAtPoint(context, launcherEnd.plusMeters(ch, 0.20, 0.1), `${withSigFigs(launcherRpm ?? 0, 3)} rpm`, 'black', 30);

    // feeder
    const feederAngle = launcherAngleDegreesConverted - 200;
    const feederLength = 0.05;
    const feederWidth = 0.1;
    const feederColor = getDirectionColor(feederPower ?? 0, frameCount);
    ch.drawLine(context, platformEnd, feederAngle, feederLength, feederColor, ch.metersToPixels(feederWidth));

    // feeder sensors
    const feederPrimaryDistanceIntoLauncher = 0.20;
    const feeder1Coordinate = ch.drawLine(context, platformEnd, launcherAngleDegreesConverted, feederPrimaryDistanceIntoLauncher, transparent, 1);
    const feeder1Meters = ch.getMetersFromCoordinate(feeder1Coordinate);
    const feederPrimary = ch.createShape(0.02, 0.02, feeder1Meters.xMeters, feeder1Meters.yMeters, isFeederAtPrimary ? chaosGreenTransparent : chaosOrangeTransparent);

    const feederSecondaryDistanceIntoLauncher = 0.25;
    const feeder2Coordinate = ch.drawLine(context, platformEnd, launcherAngleDegreesConverted, feederSecondaryDistanceIntoLauncher, transparent, 1);
    const feeder2Meters = ch.getMetersFromCoordinate(feeder2Coordinate);
    const feederSecondary = ch.createShape(0.02, 0.02, feeder2Meters.xMeters, feeder2Meters.yMeters, isFeederAtSecondary ? chaosGreenTransparent : chaosOrangeTransparent);

    const noteLength = 0.3556;
    const noteWidth = 0.0508;
    let noteStart: Coordinate | null = null;
    if (isFeederAtSecondary) {
      noteStart = feeder2Coordinate;
    } else if (isFeederAtPrimary) {
      noteStart = feeder1Coordinate;
    }
    
    if (!!noteStart) {
      ch.drawLine(context, noteStart, launcherAngleDegreesConverted + 180, noteLength, chaosOrange, ch.metersToPixels(noteWidth));
    }
    ch.drawRoundRectangle(context, feederPrimary, feederPrimary.heightPixels / 3);
    ch.drawRoundRectangle(context, feederSecondary, feederSecondary.heightPixels / 3);

    // static lift beam
    const beamLength = 0.547852;
    const beamWidth = 0.050800;
    ch.drawLine(context, ch.getCoordinateFromMeters(-0.091682, 0.071550), liftAngleDegrees, beamLength, chaosGreen, ch.metersToPixels(beamWidth));

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
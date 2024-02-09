import { NTEntry } from '../../../data/nt-manager';
import {
  ChaosCanvas,
  Coordinate,
  createShape,
  drawLine,
  drawRectangle,
  drawRoundRectangle,
  metersToPixels
} from '../util/chaos-canvas';

type ArmDisplayProps = {
  entry: NTEntry | undefined,
};
/**
 * Creates an Arm Display for CHAOS's 2023 robot.
 * The physical arm was dismantled, so this remains mostly for reference.
 */
export function ArmDisplay2023({ entry }: ArmDisplayProps) {

  const draw = (context: CanvasRenderingContext2D, [shoulderAngleDegrees, extenderLengthMeters, wristAngleDegrees, gripperPower]: (number | undefined)[], frameCount: number) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const unsafeColor = frameCount % 100 > 50 ? '#aa000055' : '#aa111177';
    const unsafeZone = createShape(0.4, 0.130, 0, 0.1, unsafeColor);
    const shoulderPivotDiamterMeters = 0.2;
    const shoulderPivot = createShape(shoulderPivotDiamterMeters, shoulderPivotDiamterMeters, 0, 1.12, 'lightgray');
    const mast = createShape(0.051, 1.29, 0, 0.1, 'forestgreen');
    const wheelDiameterMeters = 0.102;
    const wheelLeft = createShape(wheelDiameterMeters, wheelDiameterMeters, -0.27, 0.0, 'blue');
    const wheelRight = createShape(wheelDiameterMeters, wheelDiameterMeters, 0.27, 0.0, 'blue');
    const bumpers = createShape(0.863, 0.129, 0, 0.047, 'forestgreen');


    const scoringAreaOffSetXMeters = (bumpers.widthMeters / 2) + 0.0762;
    const scoringZoneWidthMeters = 1.377;
    const scoringZoneXOffsetMeters = (scoringZoneWidthMeters / 2) + scoringAreaOffSetXMeters;
    const lowLevelXOffsetMeters = (0.349 / 2) + scoringAreaOffSetXMeters;
    const midLevelXOffsetMeters = 0.58 + scoringAreaOffSetXMeters;
    const hightLevelXOffsetMeters = 1.01 + scoringAreaOffSetXMeters;
    const shelfOutterWidthMeters = 0.455;
    const shelfInnerWidthMeters = 0.43;
    const shelfInnerDepthMeters = 0.075;
    const shelfColor = '#ffffffbb';
    const scoringZoneBottom = createShape(scoringZoneWidthMeters, 0.09, scoringZoneXOffsetMeters, 0, 'red'); 
    const middleCubeNode = createShape(shelfOutterWidthMeters, 0.60, midLevelXOffsetMeters, 0, 'indigo');
    const middleCubeNodeShelf = createShape(shelfInnerWidthMeters, shelfInnerDepthMeters, midLevelXOffsetMeters, middleCubeNode.heightMeters - shelfInnerDepthMeters, shelfColor);
    const topCubeNode = createShape(shelfOutterWidthMeters, 0.90, hightLevelXOffsetMeters, 0, 'darkviolet')
    const topCubeNodeShelf = createShape(shelfInnerWidthMeters, shelfInnerDepthMeters, hightLevelXOffsetMeters, topCubeNode.heightMeters - shelfInnerDepthMeters,shelfColor);
    const openBottomShelf = createShape(0.349, 0.09, lowLevelXOffsetMeters, 0, shelfColor);
    const midPole = createShape(0.042, 0.87, midLevelXOffsetMeters, 0, 'gold');
    const highPole = createShape(0.042, 1.17, hightLevelXOffsetMeters, 0, 'gold');
    const substationLevel = createShape(scoringZoneWidthMeters, 0.1, -scoringZoneXOffsetMeters, 0.85, 'lightblue');

    shoulderAngleDegrees = shoulderAngleDegrees ?? 0;
    extenderLengthMeters = extenderLengthMeters ?? 1;
    let extenderLength1 = 0.715;
    let extenderLength2 = 0.72;
    let extenderSeparationMeters = 0.06;
    let extenderWidth = metersToPixels(0.051);
    const extenderStart1 = Coordinate.fromMeters(0, shoulderPivot.yMeters + (shoulderPivot.heightMeters / 2));
    const extenderEndpoint1 = drawLine(context, extenderStart1,  shoulderAngleDegrees, extenderLength1, 'orange', extenderWidth);
    const extenderStart2A = drawLine(context, extenderStart1,  shoulderAngleDegrees + 90, extenderSeparationMeters, 'white', extenderWidth);
    const extenderStart2B = drawLine(context, extenderStart2A,  shoulderAngleDegrees, extenderLengthMeters - extenderLength2, 'white', extenderWidth);
    const extenderEndpoint2 = drawLine(context, extenderStart2B,  shoulderAngleDegrees, extenderLength2, 'orange', extenderWidth);
    drawLine(context, extenderEndpoint2,  shoulderAngleDegrees, 0.02, 'orange', extenderWidth)

    gripperPower = gripperPower ?? 0;
    let gripperColor = 'red';
    if (gripperPower > 0) {
      gripperColor = '#134122';
    }
    if (gripperPower < 0) {
      gripperColor = '#F26722';
    }

    wristAngleDegrees = wristAngleDegrees ?? 0;
    wristAngleDegrees += shoulderAngleDegrees;
    let wristLengthMeters = 0.321;
    drawLine(context, extenderEndpoint2, wristAngleDegrees, 0.11, gripperColor, metersToPixels(0.14));
    const wideSideOffset = drawLine(context, extenderEndpoint2, wristAngleDegrees + 90, 0.097 - 0.02, gripperColor, metersToPixels(0.06));
    const narrowSideOffset = drawLine(context, extenderEndpoint2, wristAngleDegrees - 90, 0.08 - 0.03, gripperColor, metersToPixels(0.06));
    drawLine(context, wideSideOffset, wristAngleDegrees + 2, wristLengthMeters, gripperColor, metersToPixels(0.06));
    drawLine(context, narrowSideOffset, wristAngleDegrees - 3, wristLengthMeters, gripperColor, metersToPixels(0.04));

    drawRoundRectangle(context, unsafeZone, 10);
    drawRoundRectangle(context, shoulderPivot, shoulderPivot.heightPixels / 2);
    drawRectangle(context, mast);
    drawRoundRectangle(context, wheelLeft, wheelLeft.heightPixels / 2);
    drawRoundRectangle(context, wheelRight, wheelRight.heightPixels / 2);
    drawRoundRectangle(context, bumpers, bumpers.heightPixels / 3);
    drawRectangle(context, middleCubeNode );
    drawRectangle(context, middleCubeNodeShelf);
    drawRectangle(context, topCubeNode);
    drawRectangle(context, topCubeNodeShelf);
    drawRectangle(context, midPole);
    drawRectangle(context, highPole);
    drawRectangle(context, scoringZoneBottom);
    drawRectangle(context, openBottomShelf);
    drawRectangle(context, substationLevel);
  };

  return (
    <ChaosCanvas entry={entry} draw={draw}/>
  );

}
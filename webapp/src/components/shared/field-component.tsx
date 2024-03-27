import { faArrowDown, faArrowLeft, faArrowLeftRotate, faArrowRight, faArrowRightRotate, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createRef, useState, CSSProperties, useEffect } from "react";
import { DrivePose } from "../../data/drive-pose";
import { gameData } from "../../data/game-specific-data";
import { Bezier } from 'bezier-js';
import { AutoCombined, AutoPath, Position } from "../../data/auto-config";

const points = [{x: 1.442, y: 5.57}, {x: 1.32, y: 5.58}, {x: 2.17, y: 4.95}, {x: 2.073, y: 4.95}].map(p => ({x: p.x, y: -p.y}));
const bez = new Bezier(points);
console.log(bez.toSVG());

const getBezierCurve = (path: AutoPath) => {
    let waypoints = [path.waypoints[0].anchor, path.waypoints[0].nextControl, path.waypoints[path.waypoints.length - 1].prevControl, path.waypoints[path.waypoints.length - 1].anchor].filter(w => !!w) as Position[];
    // TODO: handle mid point waypoints
    waypoints = waypoints.map(p => ({x: p.x, y: -p.y}));
    return new Bezier(waypoints);
}

type CanvasProps = {
    drivePose: DrivePose | null,
    secondaryDrivePoses?: DrivePose[],
    onPoseManuallyMoved?: (pose: DrivePose) => void,
    translationToleranceMeters?: number,
    auto?: AutoCombined;
};
export function FieldCanvas({ drivePose: drivePoseIn, onPoseManuallyMoved, secondaryDrivePoses: secondaryPosesIn, translationToleranceMeters, auto }: CanvasProps) {
    const isPoseEditable = !!onPoseManuallyMoved;
    const fieldWidthMeters = gameData.fieldWidthMeters;
    const fieldHeightMeters = gameData.fieldHeightMeters;
    const robotWidthMeters = gameData.robotWidthMeters;
    const robotHeightMeters = gameData.robotHeightMeters;
    let divRef = createRef<HTMLDivElement>();

    let [drivePose, setDrivePose] = useState<DrivePose | null>(drivePoseIn);
    let [secondaryDrivePoses, setSecondaryDrivePoses] = useState<DrivePose[] | undefined>(secondaryPosesIn);
    let [robotPosition, setRobotPosition] = useState<CSSProperties>({});
    let [tolerancePosition, setTolerancePosition] = useState<CSSProperties>({});
    let [metersToPixelsRatio, setMetersToPixelsRatio] = useState<number>(1);
    const metersToPixel = (meters: number) => {
        return meters * metersToPixelsRatio;
    }
    const pixelsToMeters = (pixels: number) => {
        return pixels / metersToPixelsRatio;
    }

    const getPoseCss = (pose: DrivePose, addBackground: boolean, isEditable: boolean, opacity: number) => {
        let css: CSSProperties = {
            position: 'absolute',
            bottom: metersToPixel(pose.yMeters) - metersToPixel(robotWidthMeters / 2),
            left: metersToPixel(pose.xMeters) - metersToPixel(robotHeightMeters / 2),
            width: metersToPixel(robotWidthMeters),
            height: metersToPixel(robotHeightMeters),
            opacity: opacity,
            transform: `rotate(${360 - pose.rotationDegrees}deg)`,
            zIndex: 5,
            cursor: isEditable ? 'pointer' : 'default',
            fontSize: metersToPixel(0.5),
        };
        if (addBackground) {
            css = {
                ...css,
                backgroundImage: `url(${gameData.robotImagePath})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
            };
        }
        return css;
    };

    useEffect(() => {
        if(!auto) {
            return;
        }
        const paths = (auto.commands.filter(x => typeof x !== 'string') as AutoPath[]);
        const firstPath = paths[0];
        if(!firstPath) {
            return;
        }
        const startingPose = auto.auto.startingPose ? auto.auto.startingPose.position : firstPath?.waypoints[0].anchor;
        const startingAngle = firstPath.previewStartingState.rotation;
        console.log(startingPose, startingAngle);
        const pose = new DrivePose('', startingPose.x, startingPose.y, startingAngle);
        setDrivePose(pose);

        const allEndpoints = paths.map(p => {
            const finalPoint = p.waypoints[p.waypoints.length - 1].anchor;
            return new DrivePose('', finalPoint.x, finalPoint.y, p.goalEndState.rotation);
        })
        setSecondaryDrivePoses([pose].concat(allEndpoints));
    }, [auto]);

    useEffect(() => {
        if(!divRef?.current) {
            return;
        }
        const observer = new ResizeObserver(entries => {
            setMetersToPixelsRatio(entries[0].contentRect.width / fieldWidthMeters)
        })
        observer.observe(divRef.current)
        return () => {
            divRef.current && observer.unobserve(divRef.current)
        }
      }, [divRef]);

    useEffect(() => setDrivePose(drivePoseIn), [drivePoseIn]);

    useEffect(() => {
        if (!drivePose) {
            return;
        }
        setRobotPosition(getPoseCss(drivePose, true, isPoseEditable, 1.0));

        const toleranceM = translationToleranceMeters ?? 0.03;
        const toleranceState: CSSProperties = {
            position: 'absolute',
            bottom: metersToPixel(drivePose.yMeters) - metersToPixel(toleranceM / 2),
            left: metersToPixel(drivePose.xMeters) - metersToPixel(toleranceM / 2),
            width: metersToPixel(toleranceM),
            height: metersToPixel(toleranceM),
            borderRadius: metersToPixel(toleranceM) / 2,
            backgroundColor: `#cc00ff94`,
            zIndex: 55,
            pointerEvents: 'none',
        }
        setTolerancePosition(toleranceState);
    }, [drivePose, secondaryDrivePoses, metersToPixelsRatio])

    const roundNumber = (aNumber: number) => {
        return +aNumber.toFixed(3);
    }

    const onRobotDropped = (event: React.DragEvent<HTMLDivElement>) => {
        const newXPixels = isFinite(event.nativeEvent.offsetX) ? event.nativeEvent.offsetX : 0;
        const newYPixels = isFinite(event.nativeEvent.offsetY) ? event.nativeEvent.offsetY : 0;
        const newXMeters = roundNumber(pixelsToMeters(newXPixels));
        const newYMeters = roundNumber(pixelsToMeters((event.target as HTMLImageElement).height - newYPixels));
        onPoseManuallyMoved?.(new DrivePose("Manual Pose", newXMeters, newYMeters, drivePose?.rotationDegrees ?? 0));
    }

    const onRobotDragged = (event: React.DragEvent<HTMLDivElement>) => {
        setRobotPosition({...robotPosition, visibility: "hidden"});
        setTolerancePosition({...tolerancePosition, visibility: "hidden"});
        return event.preventDefault();
    }

    const manualButtonPressed = (xChangedMeters: number, yChangedMeters: number, angleChangedDegrees: number) => {
        if (!drivePose) {
            return;
        }
        const xMeters = roundNumber(drivePose.xMeters + xChangedMeters);
        const yMeters = roundNumber(drivePose.yMeters + yChangedMeters);
        const angleDegrees = roundNumber(drivePose.rotationDegrees + angleChangedDegrees);
        onPoseManuallyMoved?.(new DrivePose("Manual Pose", xMeters, yMeters, angleDegrees));
    }

    return <>
        <div style={{position: 'relative', backgroundColor: 'white'}} ref={divRef} onDragOver={onRobotDragged} onDrop={onRobotDropped}>
            <img src={gameData.fieldImagePath} style={{ width: '100%', textAlign: 'center', opacity: 0.5 }}></img>
            {
                secondaryDrivePoses?.map((pose, index) => {
                    const poseCss = getPoseCss(pose, true, false, 0.5);
                    const titleCss = getPoseCss(pose, false, false, 1.0);
                    return <>
                        <div style={poseCss} title={`secondary pose - x: ${pose?.xMeters}m, y: ${pose?.yMeters}m, rotation: ${pose?.rotationDegrees}deg`}></div>
                        <div style={titleCss}>{index + 1}</div>
                    </>;
                })
            }
            <div style={robotPosition} title={`${drivePose?.name} - x: ${drivePose?.xMeters}m, y: ${drivePose?.yMeters}m, rotation: ${drivePose?.rotationDegrees}deg`} draggable={isPoseEditable} onDrag={event => event?.preventDefault()}></div>
            <div style={tolerancePosition}></div>
            <svg viewBox={`0 -${fieldHeightMeters} ${fieldWidthMeters} ${fieldHeightMeters}`} style={{position: 'absolute', top: 0, left: 0}}>
                {auto?.commands.filter(a => typeof a !== 'string').map(path => getBezierCurve(path as AutoPath)).map(bz => <path vectorEffect="non-scaling-stroke" d={bz.toSVG()} style={{zIndex: 88, fill: 'transparent', stroke: 'lightgreen', strokeWidth: '3px', strokeLinejoin: 'round', strokeDasharray: '10, 5'}}></path>)}
            </svg>
        </div>
        {isPoseEditable ? <div>
            <button className="btn btn-light" onClick={() => manualButtonPressed(0, 0.1, 0)}><FontAwesomeIcon icon={faArrowUp}/></button>
            <button className="btn btn-light me-2" onClick={() => manualButtonPressed(0, -0.1, 0)}><FontAwesomeIcon icon={faArrowDown}/></button>
            <button className="btn btn-light" onClick={() => manualButtonPressed(-0.1, 0, 0)}><FontAwesomeIcon icon={faArrowLeft}/></button>
            <button className="btn btn-light me-2" onClick={() => manualButtonPressed(0.1, 0, 0)}><FontAwesomeIcon icon={faArrowRight}/></button>
            <button className="btn btn-light" onClick={() => manualButtonPressed(0, 0, -1)}><FontAwesomeIcon icon={faArrowRightRotate}/></button>
            <button className="btn btn-light me-2" onClick={() => manualButtonPressed(0, 0, 1)}><FontAwesomeIcon icon={faArrowLeftRotate}/></button>
            <em>Or manually drag the robot...</em>
        </div> : <></>}
    </>;
}
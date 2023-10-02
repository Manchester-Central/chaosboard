import { faArrowCircleUp, faArrowDown, faArrowLeft, faArrowLeftRotate, faArrowRight, faArrowRightRotate, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createRef, useState, CSSProperties, useEffect } from "react";
import { DrivePose } from "../../data/drive-pose";
import { gameData } from "../../data/game-specific-data";

type CanvasProps = {
    drivePose: DrivePose | null,
    onPoseManuallyMoved?: (pose: DrivePose) => void
};
export function FieldCanvas({ drivePose, onPoseManuallyMoved }: CanvasProps) {
    const isPoseEditable = !!onPoseManuallyMoved;
    const fieldWidthMeters = gameData.fieldWidthMeters;
    const robotWidthMeters = gameData.robotWidthMeters;
    const robotHeightMeters = gameData.robotHeightMeters;
    let divRef = createRef<HTMLDivElement>();

    let [robotPosition, setRobotPosition] = useState<CSSProperties>({});
    let [metersToPixelsRatio, setMetersToPixelsRatio] = useState<number>(1);
    const metersToPixel = (meters: number) => {
        return meters * metersToPixelsRatio;
    }
    const pixelsToMeters = (pixels: number) => {
        return pixels / metersToPixelsRatio;
    }

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
      }, [divRef])

    useEffect(() => {
        if (!drivePose) {
            return;
        }
        const newState = {
            position: 'absolute',
            bottom: metersToPixel(drivePose.yMeters) - metersToPixel(robotWidthMeters / 2),
            left: metersToPixel(drivePose.xMeters) - metersToPixel(robotHeightMeters / 2),
            width: metersToPixel(robotWidthMeters),
            height: metersToPixel(robotHeightMeters),
            backgroundImage: `url(${gameData.robotImagePath})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${360 - drivePose.rotationDegrees}deg)`,
            zIndex: 50,
            cursor: isPoseEditable ? 'pointer' : 'default',
        } as CSSProperties;
        setRobotPosition(newState);
    }, [drivePose, metersToPixelsRatio])

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
            <div style={robotPosition} title={`${drivePose?.name} - x: ${drivePose?.xMeters}m, y: ${drivePose?.yMeters}m, rotation: ${drivePose?.rotationDegrees}deg`} draggable={isPoseEditable} onDrag={event => event?.preventDefault()}></div>
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
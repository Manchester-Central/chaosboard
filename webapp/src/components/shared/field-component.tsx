import { createRef, useState, CSSProperties, useEffect } from "react";
import { DrivePose } from "../../data/drive-pose";
import { gameData } from "../../data/game-specific-data";

type CanvasProps = {
    drivePose: DrivePose | null,
};
export function FieldCanvas({ drivePose }: CanvasProps) {
    const fieldWidthMeters = gameData.fieldWidthMeters;
    const robotWidthMeters = gameData.robotWidthMeters;
    const robotHeightMeters = gameData.robotHeightMeters;
    let divRef = createRef<HTMLDivElement>();

    let [robotPosition, setRobotPosition] = useState<CSSProperties>({});
    let [metersToPixelsRatio, setMetersToPixelsRatio] = useState<number>(1);
    const metersToPixel = (meters: number) => {
        return meters * metersToPixelsRatio;
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
            zIndex: 50
        } as CSSProperties;
        setRobotPosition(newState);
    }, [drivePose, metersToPixelsRatio])

    return <>
        <div style={{position: 'relative', backgroundColor: 'white'}} ref={divRef}>
            <div style={robotPosition} title={`${drivePose?.name} - x: ${drivePose?.xMeters}m, y: ${drivePose?.yMeters}m, rotation: ${drivePose?.rotationDegrees}deg`}></div>
            <img src={gameData.fieldImagePath} style={{ width: '100%', textAlign: 'center', opacity: 0.5 }}></img>
        </div>
    </>;
}
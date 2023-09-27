import { createRef, useState, CSSProperties, useEffect } from "react";
import gameData from "../../data/game-specific-data";

type CanvasProps = {
    xMeters: number,
    yMeters: number,
    rotationDegrees: number,
};
export function FieldCanvas({ xMeters, yMeters, rotationDegrees }: CanvasProps) {
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
        const newState = {
            position: 'absolute',
            bottom: metersToPixel(yMeters) - metersToPixel(robotWidthMeters / 2),
            left: metersToPixel(xMeters) - metersToPixel(robotHeightMeters / 2),
            width: metersToPixel(robotWidthMeters),
            height: metersToPixel(robotHeightMeters),
            backgroundImage: `url(${gameData.robotImagePath})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${360 - rotationDegrees}deg)`,
            zIndex: 50
        } as CSSProperties;
        setRobotPosition(newState);
    }, [xMeters, yMeters, rotationDegrees, metersToPixelsRatio])

    return <>
        <div style={{position: 'relative'}} ref={divRef}>
            <div style={robotPosition}></div>
            <img src={gameData.fieldImagePath} style={{ width: '100%', textAlign: 'center', opacity: 0.5 }}></img>
        </div>
    </>;
}
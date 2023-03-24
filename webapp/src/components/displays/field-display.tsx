import { createRef, CSSProperties, useEffect, useState } from 'react';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';


type CanvasProps = {
    entry: NTEntry | undefined,
};
export function FieldCanvas({ entry }: CanvasProps) {
    const fieldWidthMeters = 16.522;
    const robotWidthMeters = 0.851;
    const robotHeightMeters = 0.863;
    let divRef = createRef<HTMLDivElement>();

    let [value, updateValue] = useNtEntry(entry);
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
        const value = entry?.latestValue?.value;
        if(!value || !Array.isArray(value) || value.length !== 3) {
            return;
        }
        const [x,y,rotation] = value as number[];
        const newState = {
            position: 'absolute',
            bottom: metersToPixel(y) - metersToPixel(robotWidthMeters / 2),
            left: metersToPixel(x) - metersToPixel(robotHeightMeters / 2),
            width: metersToPixel(robotWidthMeters),
            height: metersToPixel(robotHeightMeters),
            backgroundImage: 'url(/robot-image.png)',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${360 - rotation}deg)`
        } as CSSProperties;
        setRobotPosition(newState);
    }, [value, metersToPixelsRatio])

    return <>
        <div style={{position: 'relative'}} ref={divRef}>
            <div style={robotPosition}></div>
            <img src="/2023-cad-field.png" style={{ width: '100%', textAlign: 'center' }}></img>
        </div>
        {/* {value?.join(", ")} */}
    </>;
}

type FieldDisplayProps = {
    entry: NTEntry | undefined,
};
export function FieldDisplay({ entry }: FieldDisplayProps) {
    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <FieldCanvas entry={entry}></FieldCanvas>
        </div>
    );
}
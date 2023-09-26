import { useEffect, useState } from 'react';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from './shared/field-component';

type FieldDisplayProps = {
    entry: NTEntry | undefined,
};
export function FieldDisplay({ entry }: FieldDisplayProps) {
    const [value, updateValue] = useNtEntry(entry);
    const [xMeters, setXMeters] = useState<number>(0);
    const [yMeters, setYMeters] = useState<number>(0);
    const [rotationDegrees, setRotationDegrees] = useState<number>(0);

    useEffect(() => {
        if (!value) {
            return;
        }
        const [x,y,rotation] = value as number[];
        setXMeters(x);
        setYMeters(y);
        setRotationDegrees(rotation);
    }, [value])

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <FieldCanvas xMeters={xMeters} yMeters={yMeters} rotationDegrees={rotationDegrees}></FieldCanvas>
        </div>
    );
}
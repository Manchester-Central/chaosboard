import { useEffect, useState } from 'react';
import { DrivePose } from '../../data/drive-pose';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from '../shared/field-component';

type FieldDisplayProps = {
    entry: NTEntry | undefined,
};
export function FieldDisplay({ entry }: FieldDisplayProps) {
    const [value, updateValue] = useNtEntry(entry);
    const [drivePose, setDrivePose] = useState<DrivePose | null>(null);

    useEffect(() => {
        if (!value) {
            return;
        }
        const [x,y,rotation] = value as number[];
        setDrivePose(new DrivePose('robotPose', x, y, rotation));
    }, [value])

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <FieldCanvas drivePose={drivePose}></FieldCanvas>
        </div>
    );
}
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
    const [secondaryDrivePoses, setSecondaryDrivePoses] = useState<DrivePose[]>([]);

    useEffect(() => {
        if (!value || !Array.isArray(value)) {
            return;
        }
        const [x,y,rotation] = value as number[];
        setDrivePose(new DrivePose('robotPose', x, y, rotation));

        const otherPoses: DrivePose[] = [];
        for(let i = 3; i < value.length; i += 3) {
            otherPoses.push(new DrivePose('otherPose', value[i], value[i + 1], value[i + 2]));
        }
        setSecondaryDrivePoses(otherPoses);
    }, [value])

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <FieldCanvas drivePose={drivePose} secondaryDrivePoses={secondaryDrivePoses}></FieldCanvas>
        </div>
    );
}
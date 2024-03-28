import { useEffect, useState } from 'react';
import { DrivePose } from '../../data/drive-pose';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from '../shared/field-component';
import { gameData } from '../../data/game-specific-data';
import { AutoManager } from '../../data/auto-config';

type FieldDisplayProps = {
    entry: NTEntry | undefined,
};
export function FieldDisplay({ entry }: FieldDisplayProps) {
    const [value, updateValue] = useNtEntry(entry);
    const [activeAutoName] = useNtEntry(entry?.getOtherEntry(gameData.pathPlannerNtKey ?? ''));
    const [drivePose, setDrivePose] = useState<DrivePose | null>(null);
    const [secondaryDrivePoses, setSecondaryDrivePoses] = useState<DrivePose[]>([]);
    const [activeAuto, setActiveAuto] = useState(AutoManager.loadAuto(activeAutoName));

    useEffect(() => {
        setActiveAuto(AutoManager.loadAuto(activeAutoName));
    }, [activeAutoName])

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
            <FieldCanvas drivePose={drivePose} secondaryDrivePoses={secondaryDrivePoses} auto={activeAuto}></FieldCanvas>
            {activeAutoName ? <div>Selected Auto: <strong>{activeAutoName}</strong></div> : ''}
        </div>
    );
}
import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type ArmDisplayProps = {
    entry: NTEntry | undefined,
};
export function ArmDisplay({ entry }: ArmDisplayProps) {

    let value = useNtEntry(entry);

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            Arm
            <Textfit mode="single" max={60}>
                {value?.toString().replaceAll(',', ', ')}
            </Textfit>
        </div>
    );
}
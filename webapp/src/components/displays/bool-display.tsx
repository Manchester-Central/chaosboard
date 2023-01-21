import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type BoolDisplayProps = {
    entry: NTEntry | undefined,
};
export function BoolDisplay({ entry }: BoolDisplayProps) {

    let value = useNtEntry(entry);

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: value ? 'green': 'gray', textAlign: 'center' }} className={'p-2'}>
            <Textfit mode="single" max={60}>
                {value?.toString().replaceAll(',', ', ')}
            </Textfit>
        </div>
    );
}
import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type ColorDisplayProps = {
    entry: NTEntry | undefined,
};
export function ColorDisplay({ entry }: ColorDisplayProps) {

    let value = useNtEntry(entry);

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: value, textAlign: 'center' }} className={'p-2'}>
        </div>
    );
}
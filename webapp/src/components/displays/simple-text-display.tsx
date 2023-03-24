import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type SimpleDisplayProps = {
    entry: NTEntry | undefined,
};
export function SimpleDisplay({ entry }: SimpleDisplayProps) {

    let [value, updateValue] = useNtEntry(entry);

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <Textfit mode="single" max={60}>
                {value?.toString().replaceAll(',', ', ')}
            </Textfit>
        </div>
    );
}
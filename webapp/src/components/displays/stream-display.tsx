import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type StreamDisplayProps = {
    entry: NTEntry | undefined,
};
export function StreamDisplay({ entry }: StreamDisplayProps) {

    let [value, updateValue] = useNtEntry(entry);

    if(!value) {
        return <></>;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <iframe width="100%" height="98%" src={value}></iframe>
        </div>
    );
}
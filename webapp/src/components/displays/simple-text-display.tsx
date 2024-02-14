import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { HistoryManager } from '../../data/history-manager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

type SimpleDisplayProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager
};
export function SimpleDisplay({ entry, historyManager }: SimpleDisplayProps) {

    let [value, updateValue] = useNtEntry(entry);
    const valueType = entry?.latestValue?.valueType ?? 'unknown';
    const isEditable = valueType === 'double' || valueType === 'string';

    const onClick = () => {
        if (!isEditable) {
            return;
        }
        const newValue = prompt(`What's the new value for ${entry?.key}?`);
        if (entry?.latestValue?.valueType === 'double') {
            updateValue(+(newValue ?? 0), historyManager);
        } else if (entry?.latestValue?.valueType === 'string') {
            updateValue((newValue ?? ''), historyManager);
        }
    }

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <Textfit mode="single" max={60} onClick={onClick}>
                {isEditable ? <small style={{fontSize: '0.3em', opacity: 0.6}}><FontAwesomeIcon icon={faPenToSquare} /></small> : <></>} {value?.toString().replaceAll(',', ', ')}
            </Textfit>
        </div>
    );
}
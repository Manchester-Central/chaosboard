import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { HistoryManager } from '../../data/history-manager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { clampNumber } from './util/num-utils';

const DefaultSigFigs = 5;

export type NumberDisplayConfigData = {
    sigFigs?: number;
}

type NumberDisplayConfigProps = {
    config: NumberDisplayConfigData,
    onChange: (newConfig: NumberDisplayConfigData) => void,
};
export function NumberDisplayConfig({config, onChange}: NumberDisplayConfigProps) {
    const [sigFigs, setSigFigs] = useState(config.sigFigs?.toString() ?? DefaultSigFigs.toString());

    const onDigitsChanged = () => {
        const newDigits = clampNumber(+sigFigs, 1, 21);
        onChange({...config, sigFigs: newDigits});
    }

    return <div className="input-group mb-3">
        <span className="input-group-text">Sig Figs</span>
        <input  type='number' onChange={e => setSigFigs(e.target.value)} value={sigFigs} className="form-control" placeholder="Number of Significant Figures" />
        <button className="btn btn-outline-secondary" type="button" onClick={onDigitsChanged}>Update</button>
    </div>
}

type NumberDisplayProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager,
    configs: NumberDisplayConfigData,
};
export function NumberDisplay({ entry, historyManager, configs }: NumberDisplayProps) {

    let [value, updateValue] = useNtEntry(entry);
    const valueType = entry?.latestValue?.valueType ?? 'unknown';
    const isEditable = valueType === 'double';

    const onClick = () => {
        if (!isEditable) {
            return;
        }
        const newValue = prompt(`What's the new value for ${entry?.key}?`);
        if (newValue !== null) {
            updateValue(+(newValue ?? 0), historyManager);
        }
    }

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <Textfit mode="single" max={60} onClick={onClick}>
                {isEditable ? <small style={{fontSize: '0.3em', opacity: 0.6}}><FontAwesomeIcon icon={faPenToSquare} /></small> : <></>} {Intl.NumberFormat('en-US', {maximumSignificantDigits: configs?.sigFigs ?? DefaultSigFigs}).format(value)}
            </Textfit>
        </div>
    );
}
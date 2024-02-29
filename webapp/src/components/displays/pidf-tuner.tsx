import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';

type PIDFTunerDisplayProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager
};
export function PIDFTunerDisplay({ entry, historyManager }: PIDFTunerDisplayProps) {
    const [kpEntry] = useState(entry?.getSibling('P'));
    const [kiEntry] = useState(entry?.getSibling('I'));
    const [kdEntry] = useState(entry?.getSibling('D'));
    const [kfEntry] = useState(entry?.getSibling('F'));
    const [kp, updateKp] = useNtEntry(kpEntry);
    const [ki, updateKi] = useNtEntry(kiEntry);
    const [kd, updateKd] = useNtEntry(kdEntry);
    const [kf, updateKf] = useNtEntry(kfEntry);
    const [kpTempValue, setKpTempValue] = useState(0);
    const [kiTempValue, setKiTempValue] = useState(0);
    const [kdTempValue, setKdTempValue] = useState(0);
    const [kfTempValue, setKfTempValue] = useState(0);

    return (
        <table className={'table table-sm'}>
            <tbody>
                <tr>
                    <td style={{paddingLeft: 20}}>P</td>
                    <td>{kp}</td>
                    <td>
                        <input defaultValue={kp} onChange={e => setKpTempValue(+e.target.value)}/>
                        <button onClick={() => updateKp(kpTempValue, historyManager)}><FontAwesomeIcon icon={faCheck} /></button>
                    </td>
                </tr>
                <tr>
                    <td style={{paddingLeft: 20}}>I</td>
                    <td>{ki}</td>
                    <td>
                        <input defaultValue={ki} onChange={e => setKiTempValue(+e.target.value)}/>
                        <button onClick={() => updateKi(kiTempValue, historyManager)}><FontAwesomeIcon icon={faCheck} /></button>
                    </td>
                </tr>
                <tr>
                    <td style={{paddingLeft: 20}}>D</td>
                    <td>{kd}</td>
                    <td>
                        <input defaultValue={kd} onChange={e => setKdTempValue(+e.target.value)}/>
                        <button onClick={() => updateKd(kdTempValue, historyManager)}><FontAwesomeIcon icon={faCheck} /></button>
                    </td>
                </tr>
                <tr>
                    <td style={{paddingLeft: 20}}>F</td>
                    <td>{kf}</td>
                    <td>
                        <input defaultValue={kf} onChange={e => setKfTempValue(+e.target.value)}/>
                        <button onClick={() => updateKf(kfTempValue, historyManager)}><FontAwesomeIcon icon={faCheck} /></button>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
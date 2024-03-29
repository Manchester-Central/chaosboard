import { useEffect, useState } from 'react';
import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from '../shared/field-component';
import Modal from 'react-modal';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useAutos from '../../hooks/useAutos';
import { AutoCombined, AutoManager } from '../../data/auto-config';

const mapToReactSelectOptions = (values: string[]) => {
    if (!values) {
        return [];
    }
    return values.map(v => ({value: v, label: v}));
}

const modalStyle: Modal.Styles = {
    overlay: {
        zIndex: 99999,
    },
    content: {
       // backgroundColor: "#f8eee7"
    }
}

type PathPlannerPickerDisplayProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager
};
export function PathPlannerPickerDisplay({ entry, historyManager }: PathPlannerPickerDisplayProps) {
    const [activeEntry] = useState(entry?.getSibling('active'));
    const [optionsEntry] = useState(entry?.getSibling('options'));
    const [selectedEntry] = useState(entry?.getSibling('selected'));
    const [active] = useNtEntry(activeEntry);
    const [selected, updateSelected] = useNtEntry(selectedEntry);
    const [options] = useNtEntry(optionsEntry);
    const [selectOptions, setSelectOptions] = useState(mapToReactSelectOptions(options));
    const [selectedOption, setSelectedOption] = useState(selectOptions.find(s => s.value === active));
    const [isPicking, setIsPicking] = useState(false);
    const [autoConfig] = useAutos();
    const [auto, setAuto] = useState(AutoManager.loadAuto(entry?.latestValue?.value ?? ''));
    const [autos, setAutos] = useState<Set<string>>(new Set());
    const [filteredAutos, setFilteredAutos] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const newOptions = mapToReactSelectOptions(options);
        const newSelectedOption = newOptions.find(s => s.value === active);
        setSelectOptions(newOptions);
        setSelectedOption(newSelectedOption);
        setAutos(new Set([...options ?? [], ...Object.keys(autoConfig?.autos ?? {})]));
    }, [active, options, autoConfig]);

    useEffect(() => {
        setFilteredAutos(new Set([...autos].filter(n => n.toLowerCase().includes(filter.toLowerCase()))));
    }, [autos, filter]);

    useEffect(() => {
        const autoName = entry?.latestValue?.value ?? '';
        setAuto(AutoManager.loadAuto(autoName));
    }, [active, autoConfig]);

    const isKnownAuto = (name: string) => {
        if (!options || !Array.isArray(options)) {
            return false;
        }
        return options.includes(name);
    };

    return (
        <div style={{ width: '100%', textAlign: 'center', position: 'absolute', zIndex: 500 }} className={'p-2'}>
            <FieldCanvas drivePose={null} auto={auto}/>
            <button className='btn btn-light' onClick={() => setIsPicking(true)} style={{width: '100%'}}>{selectedOption?.label ?? '[Autos Not Found - View Local Autos]'}</button>
            <Modal isOpen={isPicking} style={modalStyle}>
                <div style={{display: 'flex', gap: 10, marginBottom: 10}}>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text" id="basic-addon1">Filter</span>
                        <input type="text" className="form-control" placeholder="Filter" aria-label="Filter" aria-describedby="basic-addon1" onChange={e => setFilter(e.target.value)}/>
                    </div>
                    <button className='btn btn-warning' onClick={() => setIsPicking(false)}>Cancel</button>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between'}}>
                    {[...filteredAutos].map(name => [name, AutoManager.loadAuto(name)] as [string, AutoCombined]).map(([name, autoOption]) => 
                        <div onClick={() => {updateSelected(name, historyManager); setIsPicking(false);}} className='card text-bg-dark' style={{width: '30%', cursor: 'pointer'}}>
                            <div className='card-body'>
                                <h3>{name}</h3>
                                {autoOption ? <FieldCanvas drivePose={null} auto={autoOption}/> : <>No Local Auto Found</>}
                                {isKnownAuto(name) ? <></> : <small className='text-warning'><FontAwesomeIcon icon={faWarning}/> Does not match an auto on the robot</small>}
                            </div>
                        </div>)
                    }
                </div>
            </Modal>
        </div>
    );
}
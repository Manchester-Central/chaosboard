import { useEffect, useState } from 'react';
import Select from 'react-select';
import { HistoryManager } from '../../data/history-manager';
import NTManager, { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from '../shared/field-component';
import { DrivePose } from '../../data/drive-pose';
import { loadAuto } from '../../data/auto-config';
import Modal from 'react-modal';

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
    const [isAuto] = useState(entry?.key.toLowerCase().includes('auto'));
    const [auto, setAuto] = useState(loadAuto(NTManager.autoConfigs, entry?.latestValue?.value ?? ''));

    useEffect(() => {
        const newOptions = mapToReactSelectOptions(options);
        const newSelectedOption = newOptions.find(s => s.value === active);
        setSelectOptions(newOptions);
        setSelectedOption(newSelectedOption);
    }, [active, options]);

    useEffect(() => {
        setAuto(loadAuto(NTManager.autoConfigs, entry?.latestValue?.value ?? ''));
    }, [active]);

    if (!active || !options) {
        return <>This is not a valid Chooser type</>
    }

    return (
        <div style={{ width: '100%', textAlign: 'center', position: 'absolute', zIndex: 500 }} className={'p-2'}>
            {isAuto ? <FieldCanvas drivePose={null} auto={auto}/>: <></>}
            <button className='btn btn-light' onClick={() => setIsPicking(true)} style={{width: '100%'}}>{selectedOption?.label}</button>
            <Modal isOpen={isPicking} style={modalStyle}>

            </Modal>
        </div>
    );
}
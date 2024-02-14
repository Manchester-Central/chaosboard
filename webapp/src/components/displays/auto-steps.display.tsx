import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { AutoStep } from '../../data/auto-step';
import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { AutoEditor } from '../shared/auto-editor';
import { FieldCanvas } from '../shared/field-component';
import { SimpleDisplay } from './simple-text-display';

type AutoStepsProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager
};
export function AutoStepsDisplay({ entry, historyManager }: AutoStepsProps) {

    let [value, updateValue] = useNtEntry(entry);
    let [autoSteps, setAutoSteps] = useState<AutoStep[]>([]);
    let [isEditing, setIsEditing] = useState(false);
    const inputFile = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            setAutoSteps(value.map((line: string) => new AutoStep(line)));
        }
    }, [value]);

    if (value && !Array.isArray(value)) {
        return <SimpleDisplay entry={entry} historyManager={historyManager}></SimpleDisplay>;
    }

    const getStyle = (key: string) => {
        switch(key.toLowerCase()) {
            case 'drivepose':
            case 'x':
            case 'y':
            case 'angle':
                return 'text-bg-primary';
            case 'armpose':
                return 'text-bg-success';
            default:
                return 'text-bg-secondary';
        }
    }

    const onUploadButtonClick = () => {
        // `current` points to the mounted file input element
        inputFile.current?.click();
    };

    const onEditButtonClick = () => {
        setIsEditing(true);
    };

    const onChangeFile = (event: any)  => {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        const reader = new FileReader()
        reader.onload = async (e: any) => { 
          const text = (e.target.result) as string;
          const lines = text.split('\n').map(s => s.trim());
          //lines.unshift(`File name: ${file.name}`);
          updateValue(lines, historyManager);
        };
        reader.readAsText(file)
    }

    const onEditFinished = (newSteps: AutoStep[]) => {
        const lines = newSteps.map(s => s.rawLine);
        updateValue(lines, historyManager);
        setIsEditing(false);
    }

    const getExtraDisplays = (step: AutoStep) => {
        const drivePose = step.assumeDrivePose();
        if (drivePose) {
            return <><div style={{marginTop: 5}}></div><FieldCanvas drivePose={drivePose.pose} translationToleranceMeters={drivePose.translationtoleranceMeters} /></>
        }
        return <></>
    }

    const modalStyle: Modal.Styles = {
        overlay: {
            zIndex: 99999,
        },
        content: {
           // backgroundColor: "#f8eee7"
        }
    }

    return (
        <>
            <Modal isOpen={isEditing} style={modalStyle} >
                <AutoEditor initialAutoSteps={autoSteps} onUpdate={onEditFinished} onCancel={() => setIsEditing(false)}/>
            </Modal>
            <div style={{display: 'flex', flexDirection: 'row', gap: 10}}>
                <button className='btn btn-chaos' onClick={onUploadButtonClick} style={{flexGrow: 1}}>Upload Auto</button>
                <button className='btn btn-primary' onClick={onEditButtonClick} style={{flexGrow: 1}}>Edit Auto</button>
            </div>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} onClick={(event)=> (event.target as HTMLInputElement).value = ''}/>
            <ul className='list-group list-group-flush'>
                {autoSteps.map(step => {
                    const params = Object.keys(step.params).map((key) => {
                        const paramValue = step.params[key];
                        return <span className={`badge ${getStyle(key)} me-1`}><span style={{fontSize: '0.7em'}}>{key}:</span> {paramValue}</span>
                    })
                    return <li className='list-group-item p-2'>
                        <h5 className='mb-0'><strong>{step.command}</strong> <br/> {params} {getExtraDisplays(step)}</h5>
                        
                    </li>;
                })}
            </ul>
        </>
    );
}
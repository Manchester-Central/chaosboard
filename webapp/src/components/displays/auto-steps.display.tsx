import { useRef } from 'react';
import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { SimpleDisplay } from './simple-text-display';

class AutoStep {
    command: string;
    params: URLSearchParams;

    constructor(line: string){
        const lineSplit = line.split('?');
        this.command = lineSplit[0];
        this.params = new URLSearchParams(lineSplit[1] ?? '');
    }
}

type AutoStepsProps = {
    entry: NTEntry | undefined,
};
export function AutoStepsDisplay({ entry }: AutoStepsProps) {

    let [value, updateValue] = useNtEntry(entry);
    const inputFile = useRef<HTMLInputElement>(null) 

    if(!Array.isArray(value)) {
        return <SimpleDisplay entry={entry}></SimpleDisplay>;
    }

    const getStyle = (key: string) => {
        switch(key.toLowerCase()) {
            case 'drivepose':
                return 'text-bg-primary';
            case 'armpose':
                return 'text-bg-success';
            default:
                return 'text-bg-secondary';
        }
    }

    const onButtonClick = () => {
    // `current` points to the mounted file input element
        inputFile.current?.click();
    };

    const onChangeFile = (event: any)  => {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        const reader = new FileReader()
        reader.onload = async (e: any) => { 
          const text = (e.target.result) as string;
          updateValue(text.split('\n').map(s => s.trim()))
        };
        reader.readAsText(event.target.files[0])
    }

    return (
        <>
            <div className='d-grid gap-2'>
                <button className='btn btn-chaos' onClick={onButtonClick}>Upload Auto</button>
            </div>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile}/>
            <ul className='list-group list-group-flush'>
                {value.map(value => {
                    const step = new AutoStep(value);
                    const params = [...step.params.entries()].map(([key, value]) => {
                        return <span className={`badge ${getStyle(key)} me-1`}><span style={{fontSize: '0.7em'}}>{key}:</span> {value}</span>
                    })
                    return <li className='list-group-item p-2'>
                        <h5 className='mb-0'>{step.command} {params}</h5>
                        
                    </li>;
                })}
            </ul>
        </>
    );
}
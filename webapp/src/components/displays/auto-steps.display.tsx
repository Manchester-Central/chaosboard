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

    let value = useNtEntry(entry);

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

    return (
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
    );
}
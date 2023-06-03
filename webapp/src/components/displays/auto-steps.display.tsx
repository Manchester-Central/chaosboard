import { useRef } from 'react';
import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import { FieldCanvas } from './shared/field-component';
import { SimpleDisplay } from './simple-text-display';

const ScoreXMeters = 1.855;
const ScoreAngle = 180;
const drivePoses: Record<string, {xMeters: number, yMeters: number, rotationDegrees: number}> = {};
const addDrivePose = (name: string, xMeters: number, yMeters: number, rotationDegrees: number) => drivePoses[name] = {xMeters, yMeters, rotationDegrees};
addDrivePose("Score1", ScoreXMeters, 7.503, ScoreAngle);
addDrivePose("Score2", ScoreXMeters, 6.932, ScoreAngle);
addDrivePose("Score3", ScoreXMeters, 6.386, ScoreAngle);
addDrivePose("Score4", ScoreXMeters, 5.827, ScoreAngle);
addDrivePose("Score5", ScoreXMeters, 5.268, ScoreAngle);
addDrivePose("Score6", ScoreXMeters, 4.709, ScoreAngle);
addDrivePose("Score7", ScoreXMeters, 4.151, ScoreAngle);
addDrivePose("Score8", ScoreXMeters, 3.592, ScoreAngle);
addDrivePose("Score9", ScoreXMeters, 3.033, ScoreAngle);

class AutoStep {
    command: string;
    params: Record<string, string>;

    constructor(line: string){
        const lineSplit = line.split('?');
        this.command = lineSplit[0];
        const params = new URLSearchParams(lineSplit[1] ?? '');
        this.params = [...params.entries()].reduce((newObject, currentValue) => {
            newObject[currentValue[0]] = currentValue[1];
            return newObject;
        }, {} as Record<string, string>);
    }

    getParam(key: string) {
        const foundKey = Object.keys(this.params).find(otherKey => otherKey.toLowerCase() === key.toLowerCase());
        return foundKey ? this.params[foundKey] : null;
    }
}

type AutoStepsProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager
};
export function AutoStepsDisplay({ entry, historyManager }: AutoStepsProps) {

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
          updateValue(text.split('\n').map(s => s.trim()), historyManager)
        };
        reader.readAsText(event.target.files[0])
    }

    const getExtraDisplays = (step: AutoStep) => {
        let xMeters = step.getParam('x') ?? 0;
        let yMeters = step.getParam('y') ?? 0;
        let rotationDegrees = step.getParam('angle') ?? 0;
        const drivePose = step.getParam("drivepose");
        if (drivePose) {
            const pose = drivePoses[drivePose];
            xMeters = pose?.xMeters ?? xMeters;
            yMeters = pose.yMeters ?? yMeters;
            rotationDegrees = pose?.rotationDegrees ?? rotationDegrees;
        }
        if (xMeters || yMeters || rotationDegrees) {
            return <><div style={{marginTop: 5}}></div><FieldCanvas xMeters={+xMeters} yMeters={+yMeters} rotationDegrees={+rotationDegrees} /></>
        }
        return <></>
    }

    return (
        <>
            <div className='d-grid gap-2'>
                <button className='btn btn-chaos' onClick={onButtonClick}>Upload Auto</button>
            </div>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onChangeFile} onClick={(event)=> (event.target as HTMLInputElement).value = ''}/>
            <ul className='list-group list-group-flush'>
                {value.map(value => {
                    const step = new AutoStep(value);
                    const params = Object.keys(step.params).map((key) => {
                        const paramValue = step.params[key];
                        return <span className={`badge ${getStyle(key)} me-1`}><span style={{fontSize: '0.7em'}}>{key}:</span> {paramValue}</span>
                    })
                    return <li className='list-group-item p-2'>
                        <h5 className='mb-0'>{step.command} {params} {getExtraDisplays(step)}</h5>
                        
                    </li>;
                })}
            </ul>
        </>
    );
}
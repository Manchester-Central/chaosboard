import { AutoStep } from "../../data/auto-step";
import { gameData } from "../../data/game-specific-data";
import { FieldCanvas } from "./field-component";
import { Typeahead } from 'react-bootstrap-typeahead';
import { AutoCommand, AutoCommandArgument } from "../../data/auto-command";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

const newParamRow = (key: string, value: string) => ({id: uuidv4(), key, value});

const getKnownCommand = (commandName: string) => {
    return gameData.autoCommands.find(command => command.commandName.toLowerCase() === commandName?.toLowerCase().trim()) ?? null;
}

const getKnownCommandArg = (autoCommand: AutoCommand | null, argName: string | null) => {
    return autoCommand?.args.find(arg => arg.argName.toLowerCase() === argName?.toLowerCase().trim());
}

const getArgFields = (step: AutoStep, knownCommand: AutoCommand | null) => {
    const keys = step.getAllParams().map(([key]) => key).filter(param => !getKnownCommandArg(knownCommand, param)).concat(knownCommand?.args.map(arg => arg.argName) ?? []).filter(k => !!k);
    return keys.map(key => newParamRow(key, step.getParam(key) ?? ''));
}

type AutoEditParamLineProps = {
    id: string;
    autoCommand: AutoCommand | null,
    initialKey: string | null,
    initialValue: string | null,
    onUpdated: (id: string, newKey: string | null, newValue: string | null) => void,
};
function AutoEditParamLine({ id, autoCommand, initialKey, initialValue, onUpdated }: AutoEditParamLineProps) {
    const [key, setKey] = useState(initialKey);
    const [value, setValue] = useState(initialValue);
    const [knownArg, setKnownArg] = useState(autoCommand ? getKnownCommandArg(autoCommand, key) : null);

    useEffect(() => {
        setKnownArg(autoCommand ? getKnownCommandArg(autoCommand, key) : null);
        onUpdated(id, key, value);
    }, [key, value]);

    return <div style={{display: 'flex', gap: 5, marginTop: 5}}>
        <Typeahead
            id={id + "key"}
            labelKey="argName"
            onChange={options => setKey((options[0] as AutoCommandArgument)?.argName)}
            options={autoCommand?.args ?? []}
            defaultInputValue={key ?? undefined}
            style={{width: 200}}
            onInputChange={(newKey) => setKey(newKey)}
        />
        <Typeahead
            id={id + "value"}
            labelKey="possibleValue"
            onChange={options => setValue((options[0] as {possibleValue: string})?.possibleValue)}
            options={knownArg?.possibleValues.map(possibleValue => ({possibleValue})) ?? []}
            defaultInputValue={value ?? undefined}
            style={{flexGrow: 1}}
            onInputChange={(newValue) => setValue(newValue)}
        />
    </div>;
}

type AutoEditLineProps = {
    initialAutoStep: AutoStep,
    onStepUpdated: (newStep: AutoStep) => void,
    onStepDeleted: () => void,
    onStepMoved: (incrementAmount: number) => void,
};
function AutoEditLine({ initialAutoStep, onStepUpdated, onStepDeleted, onStepMoved }: AutoEditLineProps) {
    const [autoStep, setAutoStep] = useState(initialAutoStep);

    const [knownCommand, setKnownCommand] = useState(getKnownCommand(autoStep.command));
    const [args, setArgs] = useState<{id: string, key: string, value: string | null}[]>(getArgFields(autoStep, knownCommand));

    const addParam = () => {
        setArgs(args.concat(newParamRow('', '')));
    }

    // Handles a weird bug with arg setting, so delaying until after the original update
    useEffect(() => {
        if (args.length !== 0) {
            return;
        }
        const newArgs = getArgFields(autoStep, knownCommand);
        if (newArgs.length > 0) {
            setArgs(newArgs);
        }
    }, [args]);

    // Handles a weird bug with arg setting, so delaying until after the original update
    useEffect(() => {
        onStepUpdated(autoStep);
    }, [autoStep]);

    const updateCommandName = (newCommandName: string) => {
        const newStep = AutoStep.createNewStep(newCommandName ?? '', {}, autoStep.id);
        setAutoStep(newStep);
        const newKnownCommand = getKnownCommand(newStep.command);
        setKnownCommand(newKnownCommand);
        setArgs([]); // Updates by `useEffect` above
    }

    const updateArg = (id: string, newKey: string | null, newValue: string | null) => {
        const arg = args.find(arg => arg.id === id);
        if(!arg) {
            return;
        }
        arg.key = newKey ?? '';
        arg.value = newValue ?? '';
        const params = args.reduce((params, arg) => { params[arg.key] = arg.value ?? ''; return params; }, {} as Record<string, string>);
        const newStep = AutoStep.createNewStep(autoStep.command ?? '', params, autoStep.id);
        setAutoStep(newStep);
    }
    
    const drivePose = autoStep.assumeDrivePose();
    const fieldDisplay = drivePose ? <FieldCanvas drivePose={drivePose} />: <></>;

    return <div style={{display: 'flex', gap: 10}}>
        <div style={{minWidth: 500, width: 500}}>
            <Typeahead
                id={autoStep.id + "command"}
                labelKey="commandName"
                onChange={options => updateCommandName((options[0] as AutoCommand)?.commandName)}
                options={gameData.autoCommands}
                placeholder="Choose a state..."
                defaultInputValue={autoStep.command}
                onInputChange={newName => updateCommandName(newName)}
            />
            <div style={{marginLeft: 100}}>
                {args.map(({id, key, value}) => {
                    return <div key={id+"line"}><AutoEditParamLine id={id} autoCommand={knownCommand} initialKey={key} initialValue={value} onUpdated={(updatedId, newKey, newValue) => updateArg(updatedId, newKey, newValue)}/></div>
                })}
                <button className="btn btn-secondary mb-2 mt-2" onClick={addParam}><FontAwesomeIcon icon={faPlus} /> Param</button>
            </div>
        </div>
        <div style={{flexGrow: 2}}>
            {fieldDisplay}
            <pre className="mt-2" style={{width: '100%'}}>{autoStep.rawLine}</pre>
        </div>
        <div>
            <button className="btn btn-secondary" onClick={() => onStepMoved(-1)}><FontAwesomeIcon icon={faAngleUp} /></button>
        </div>
        <div>
            <button className="btn btn-secondary" onClick={() => onStepMoved(1)}><FontAwesomeIcon icon={faAngleDown} /></button>
        </div>
        <div>
            <button className="btn btn-danger" onClick={() => onStepDeleted()}><FontAwesomeIcon icon={faTrash} /></button>
        </div>
    </div>;
}

type AutoEditorProps = {
    initialAutoSteps: AutoStep[],
    onUpdate: (newSteps: AutoStep[]) => void,
    onCancel: () => void,
};
export function AutoEditor({ initialAutoSteps, onUpdate, onCancel }: AutoEditorProps) {
    const [autoSteps, setAutoSteps] = useState(initialAutoSteps);

    const replaceStep = (oldStep: AutoStep, newStep: AutoStep) => {
        const index = autoSteps.indexOf(oldStep);
        autoSteps.splice(index, 1, newStep);
        setAutoSteps(autoSteps.slice());
    }

    const addStep = () => {
        setAutoSteps(autoSteps.concat([new AutoStep('')]));
    }

    const moveStep = (step: AutoStep, incrementAmount: number) => {
        const newSteps = autoSteps.slice();
        const start = newSteps.indexOf(step);
        const target = start + incrementAmount;
        if (target < 0 || target > newSteps.length - 1) {
            return;
        }
        const stepToReplace = newSteps[target];
        newSteps[target] = step;
        newSteps[start] = stepToReplace;
        setAutoSteps(newSteps);
    }

    const removeStep = (stepToRemove: AutoStep) => {
        const newSteps = autoSteps.filter(step => step !== stepToRemove);
        setAutoSteps(newSteps);
    }

    async function saveFile() {
        const content = autoSteps.map(step => `${step.rawLine}`).join('\r\n');
        var blob = new Blob([content], {
          type: 'text/plain'
        });
        const opts = {
            types: [
                {
                    description: "Text file",
                    accept: { "text/plain": [".txt"] },
                },
            ],
        };
        const fileHandle = await (window as any).showSaveFilePicker(opts);
        const writer = await fileHandle.createWritable();
        await writer.write({type: "write", data: blob, size: blob.size});
        await writer.close();
    }

    const save = () => {
        saveFile().then(() => {
            onUpdate(autoSteps);
        });
    }

    return <>
        <h1>Auto Step Builder</h1>
        {autoSteps.map((step) => {
            return <div key={step.id+"edit"}>
                <AutoEditLine
                    initialAutoStep={step}
                    onStepUpdated={newStep => replaceStep(step, newStep)}
                    onStepDeleted={() => removeStep(step)}
                    onStepMoved={incerementAmount => moveStep(step, incerementAmount)}
                />
                <hr />
            </div>
        })}
        <button className="btn btn-secondary" onClick={addStep}>Add Step</button>

        <hr />
        
        <h1>Result</h1>
        {autoSteps.map((step) => {
            return <div key={step.id+"list"}>
                <pre>{step.rawLine}</pre>
            </div>
        })}

        <div style={{display: 'flex', gap: 5}}>
            <button className="btn btn-primary" onClick={save}>Update</button>
            <button className='btn btn-danger' onClick={() => onCancel()}>Cancel</button>
        </div>
    </>;
}
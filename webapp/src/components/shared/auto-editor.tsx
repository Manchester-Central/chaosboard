import { AutoStep } from "../../data/auto-step";
import { gameData } from "../../data/game-specific-data";
import { FieldCanvas } from "./field-component";
import { Typeahead } from 'react-bootstrap-typeahead';
import { AutoCommand, AutoCommandArgument } from "../../data/auto-command";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

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

    return <div style={{display: 'flex', gap: 5, marginTop: 5, marginBottom: 5}}>
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
};
function AutoEditLine({ initialAutoStep }: AutoEditLineProps) {
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

    const updateCommandName = (newCommandName: string) => {
        const newStep = AutoStep.createNewStep(newCommandName ?? '', {});
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
        const newStep = AutoStep.createNewStep(autoStep.command ?? '', params);
        setAutoStep(newStep);
    }
    
    const drivePose = autoStep.assumeDrivePose();
    const fieldDisplay = drivePose ? <FieldCanvas drivePose={drivePose} />: <></>;

    return <>
        <Typeahead
            id={autoStep.command}
            labelKey="commandName"
            onChange={options => updateCommandName((options[0] as AutoCommand)?.commandName)}
            options={gameData.autoCommands}
            placeholder="Choose a state..."
            defaultInputValue={autoStep.command}
            onInputChange={newName => updateCommandName(newName)}
        />
        <div style={{marginLeft: 100}}>
            {args.map(({id, key, value}) => {
                return <AutoEditParamLine id={id} autoCommand={knownCommand} initialKey={key} initialValue={value} onUpdated={(updatedId, newKey, newValue) => updateArg(updatedId, newKey, newValue)}/>
            })}
            <button className="btn btn-secondary mb-2" onClick={addParam}>Add Param</button>
            {fieldDisplay}
            <pre className="mt-2">{autoStep.rawLine}</pre>
        </div>
    </>;
}

type AutoEditorProps = {
    autoSteps: AutoStep[],
};
export function AutoEditor({ autoSteps }: AutoEditorProps) {
    return <>
        <h1>Auto Step Builder</h1>
        {autoSteps.map(step => {
            return <>
                <AutoEditLine initialAutoStep={step}/>
                <hr />
            </>
        })}
    </>;
}
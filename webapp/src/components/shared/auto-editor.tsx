import { AutoStep } from "../../data/auto-step";
import { gameData } from "../../data/game-specific-data";
import { FieldCanvas } from "./field-component";
import { Typeahead } from 'react-bootstrap-typeahead';
import { AutoCommand } from "../../data/auto-command";

type AutoEditorLine = {
    autoStep: AutoStep,
};
function AutoEditLine({ autoStep }: AutoEditorLine) {
    const getKnownCommand = (commandName: string) => {
        return gameData.autoCommands.find(command => command.commandName.toLowerCase() === commandName.toLowerCase().trim())
    }

    const getKnownCommandArg = (autoCommand: AutoCommand, argName: string) => {
        return autoCommand.args.find(arg => arg.argName.toLowerCase() === argName.toLowerCase().trim())
    }

    const drivePose = autoStep.assumeDrivePose();
    const fieldDisplay = drivePose ? <FieldCanvas drivePose={drivePose} />: <></>

    return <>
        <Typeahead
            id="basic-typeahead-single"
            labelKey="commandName"
            //onChange={setSingleSelections}
            options={gameData.autoCommands}
            placeholder="Choose a state..."
            defaultInputValue={autoStep.command}
        />
        <div style={{marginLeft: 100}}>
            {autoStep.getAllParams().map(([key, value]) => {
                const knownCommand = getKnownCommand(autoStep.command);
                const knownArg = knownCommand ? getKnownCommandArg(knownCommand, key) : null;
                return <div style={{display: 'flex'}}>
                    <Typeahead
                        id="basic-typeahead-single"
                        labelKey="argName"
                        //onChange={setSingleSelections}
                        options={knownCommand?.args ?? []}
                        placeholder="Choose a state..."
                        defaultInputValue={key}
                        style={{width: 200}}
                    />
                    <Typeahead
                        id="basic-typeahead-single"
                        labelKey="possibleValue"
                        //onChange={setSingleSelections}
                        options={knownArg?.possibleValues.map(possibleValue => ({possibleValue})) ?? []}
                        placeholder="Choose a state..."
                        defaultInputValue={value}
                        style={{flexGrow: 1}}
                    />
                </div>
            })}
            {fieldDisplay}
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
                <AutoEditLine autoStep={step}/>
                <hr />
            </>
        })}
    </>;
}
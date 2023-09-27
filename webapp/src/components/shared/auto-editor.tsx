import { AutoStep } from "../../data/auto-step";

type AutoEditorProps = {
    autoSteps: AutoStep[],
};
export function AutoEditor({ autoSteps }: AutoEditorProps) {
    return <>
        {autoSteps.map(step => <h1>{step.command}</h1>)}
    </>;
}
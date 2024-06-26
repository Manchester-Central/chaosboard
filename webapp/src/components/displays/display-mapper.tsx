import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import { ArmDisplay2023 } from './old/arm-display-2023';
import { AutoStepsDisplay } from './auto-steps.display';
import { BoolDisplay } from './bool-display';
import { ColorDisplay } from './color-display';
import { FieldDisplay, FieldDisplayConfig, FieldDisplayConfigData } from './field-display';
import { SimpleDisplay } from './simple-text-display';
import { StreamDisplay } from './stream-display';
import { TempDisplay } from './temp-display';
import { RobotDisplay2024 } from './robot-display-2024';
import { ChooserDisplay } from './chooser-display';
import { PIDFTunerDisplay } from './pidf-tuner';
import { PathPlannerPickerDisplay, PathPlannerPickerDisplayConfig } from './path-planner-picker';
import { NumberDisplay, NumberDisplayConfig } from './number-display';

export enum DisplayType {
    Simple = 'Simple',
    Number = 'Number',
    Bool = 'Boolean',
    Chooser = 'Chooser',
    Color = 'Color',
    Field = 'Field',
    Stream = 'Stream',
    AutoSteps = 'Auto Steps',
    Temp = 'Temp',
    PathPlanner = 'PathPlanner Picker',
    PIDFTuner = 'PID/PIDF Tuner',
    Robot2024 = 'Robot - 2024',
    Arm2023 = '[Old] Arm - 2023',
}

type DisplayMapperProps = {
    entry: NTEntry | undefined,
    selectedDisplayType: DisplayType,
    historyManager: HistoryManager,
    configs: any,
};
export function DisplayMapper({ entry, selectedDisplayType, historyManager, configs }: DisplayMapperProps) {

    switch(selectedDisplayType) {
        case DisplayType.Bool:
            return <BoolDisplay entry={entry}/>;
        case DisplayType.Number:
            return <NumberDisplay entry={entry} historyManager={historyManager} configs={configs}/>;
        case DisplayType.Chooser:
            return <ChooserDisplay entry={entry} historyManager={historyManager}/>;
        case DisplayType.Color:
            return <ColorDisplay entry={entry}/>;
        case DisplayType.Field:
            return <FieldDisplay entry={entry} configs={configs}/>;
        case DisplayType.Stream:
            return <StreamDisplay entry={entry}/>;
        case DisplayType.AutoSteps:
            return <AutoStepsDisplay entry={entry} historyManager={historyManager}/>;
        case DisplayType.Temp:
            return <TempDisplay entry={entry}/>;
        case DisplayType.PIDFTuner:
            return <PIDFTunerDisplay entry={entry} historyManager={historyManager}/>;
        case DisplayType.PathPlanner:
            return <PathPlannerPickerDisplay entry={entry} historyManager={historyManager} configs={configs}/>;
        case DisplayType.Robot2024:
            return <RobotDisplay2024 entry={entry}/>;
        case DisplayType.Arm2023:
            return <ArmDisplay2023 entry={entry}/>;
        default:
            return <SimpleDisplay entry={entry} historyManager={historyManager}/>;
    }

}

export function getDefaultType(entry: NTEntry) {
    switch(entry?.latestValue?.valueType) {
        case 'boolean':
            return DisplayType.Bool;
        case 'integer':
        case 'double':
            if (entry?.key.toLowerCase().includes("tuner")) {
                return DisplayType.PIDFTuner;
            }
            return DisplayType.Number;
        case 'double[]':
            let numberArrayValue = entry?.latestValue.value as number[];
            if(numberArrayValue.length === 3) {
                return DisplayType.Field;
            }
            if(entry.key.toLowerCase().includes('robot2024/state')) {
                return DisplayType.Robot2024;
            }
            if(entry.key.toLowerCase().includes('arm')) {
                return DisplayType.Arm2023;
            }
            return DisplayType.Simple;
        case 'string':
            let stringValue = entry?.latestValue.value as string;
            if(stringValue.startsWith('#')) {
                return DisplayType.Color;
            }
            if (entry?.key.toLowerCase().includes("chooser") && entry?.key.toLowerCase().includes("auto")) {
                return DisplayType.PathPlanner;
            }
            if (entry?.key.toLowerCase().includes("chooser")) {
                return DisplayType.Chooser;
            }
            return DisplayType.Simple;
        case 'string[]':
            return DisplayType.AutoSteps;
        default:
            return DisplayType.Simple;
    }
}

export function shouldUseParentTitle(type: DisplayType) {
    return [DisplayType.Chooser, DisplayType.PathPlanner, DisplayType.PIDFTuner].includes(type);
}

export function getConfigComponent(type: DisplayType | undefined, config: any, onChanged: (newConfig: any) => void) {

    switch(type) {
        case DisplayType.Number:
            return <NumberDisplayConfig config={config} onChange={onChanged}/>;
        case DisplayType.Field:
            return <FieldDisplayConfig config={config} onChange={onChanged}/>;
        case DisplayType.PathPlanner:
            return <PathPlannerPickerDisplayConfig config={config} onChange={onChanged}/>;
        default:
            return undefined;
    }
}
import { HistoryManager } from '../../data/history-manager';
import { NTEntry } from '../../data/nt-manager';
import { ArmDisplay2023 } from './old/arm-display-2023';
import { AutoStepsDisplay } from './auto-steps.display';
import { BoolDisplay } from './bool-display';
import { ColorDisplay } from './color-display';
import { FieldDisplay } from './field-display';
import { SimpleDisplay } from './simple-text-display';
import { StreamDisplay } from './stream-display';
import { TempDisplay } from './temp-display';
import { RobotDisplay2024 } from './robot-display-2024';

export enum DisplayType {
    Simple = 'Simple',
    Bool = 'Boolean',
    Color = 'Color',
    Field = 'Field',
    Stream = 'Stream',
    AutoSteps = 'Auto Steps',
    Temp = 'Temp',
    Robot2024 = 'Robot - 2024',
    Arm2023 = '[Old] Arm - 2023',
}

type DisplayMapperProps = {
    entry: NTEntry | undefined,
    selectedDisplayType: DisplayType,
    historyManager: HistoryManager
};
export function DisplayMapper({ entry, selectedDisplayType, historyManager }: DisplayMapperProps) {

    switch(selectedDisplayType) {
        case DisplayType.Bool:
            return <BoolDisplay entry={entry}/>;
        case DisplayType.Color:
            return <ColorDisplay entry={entry}/>;
        case DisplayType.Field:
            return <FieldDisplay entry={entry}/>;
        case DisplayType.Stream:
            return <StreamDisplay entry={entry}/>;
        case DisplayType.AutoSteps:
            return <AutoStepsDisplay entry={entry} historyManager={historyManager}/>;
        case DisplayType.Temp:
            return <TempDisplay entry={entry}/>;
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
            return DisplayType.Simple;
        case 'string[]':
            return DisplayType.AutoSteps;
        default:
            return DisplayType.Simple;
    }
}
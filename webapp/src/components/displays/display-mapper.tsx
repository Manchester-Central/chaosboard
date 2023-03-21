import { NTEntry } from '../../data/nt-manager';
import { ArmDisplay } from './arm-display';
import { AutoStepsDisplay } from './auto-steps.display';
import { BoolDisplay } from './bool-display';
import { ColorDisplay } from './color-display';
import { FieldDisplay } from './field-display';
import { SimpleDisplay } from './simple-text-display';
import { StreamDisplay } from './stream-display';

export enum DisplayType {
    Simple = 'Simple',
    Bool = 'Boolean',
    Color = 'Color',
    Field = 'Field',
    Arm = 'Arm',
    Stream = 'Stream',
    AutoSteps = 'Auto Steps',
}

type DisplayMapperProps = {
    entry: NTEntry | undefined,
    selectedDisplayType: DisplayType
};
export function DisplayMapper({ entry, selectedDisplayType }: DisplayMapperProps) {

    const getDisplay = () => {
        switch(selectedDisplayType) {
            case DisplayType.Arm:
                return ArmDisplay({entry})
            case DisplayType.Bool:
                return BoolDisplay({entry});
            case DisplayType.Color:
                return ColorDisplay({entry});
            case DisplayType.Field:
                return FieldDisplay({entry});
            case DisplayType.Stream:
                return StreamDisplay({entry});
            case DisplayType.AutoSteps:
                return AutoStepsDisplay({entry});
            default:
                return SimpleDisplay({entry});
        }
    }

    return (
        <>
            {getDisplay()}
        </>
    );
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
            if(entry.key.toLowerCase().includes('arm')) {
                return DisplayType.Arm;
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
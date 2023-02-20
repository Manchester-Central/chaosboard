import { NTEntry } from '../../data/nt-manager';
import { BoolDisplay } from './bool-display';
import { FieldDisplay } from './field-display';
import { SimpleDisplay } from './simple-text-display';

export enum DisplayType {
    Simple = 'Simple',
    Bool = 'Boolean',
    Field = 'Field',
}

type DisplayMapperProps = {
    entry: NTEntry | undefined,
    selectedDisplayType: DisplayType
};
export function DisplayMapper({ entry, selectedDisplayType }: DisplayMapperProps) {

    const getDisplay = () => {
        switch(selectedDisplayType) {
            case DisplayType.Bool:
                return BoolDisplay({entry});
            case DisplayType.Field:
                return FieldDisplay({entry});
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
            return DisplayType.Field;
        default:
            return DisplayType.Simple;
    }
}
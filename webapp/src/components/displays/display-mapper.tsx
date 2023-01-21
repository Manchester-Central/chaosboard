import { NTEntry } from '../../data/nt-manager';
import { BoolDisplay } from './bool-display';
import { SimpleDisplay } from './simple-text-display';

export enum DisplayType {
    Simple = 'Simple',
    Bool = 'Boolean',
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
        case 'Boolean':
            return DisplayType.Bool;
        default:
            return DisplayType.Simple;
    }
}
import { Textfit } from 'react-textfit';
import { NTEntry } from '../../data/nt-manager';
import useNtEntry from '../../hooks/useNtEntry';
import GaugeChart from 'react-gauge-chart';

type TempDisplayProps = {
    entry: NTEntry | undefined,
};
export function TempDisplay({ entry }: TempDisplayProps) {

    let [value, updateValue] = useNtEntry(entry);

    const chartStyle = {
        height: '100%',
    }

    return (
        <div style={{ width: '100%', textAlign: 'center' }} className={'p-2'}>
            <GaugeChart id={`${entry?.key}-temp`}
                style={chartStyle}
                nrOfLevels={20}
                percent={value / 100}
                animate={false}
                textColor={'black'}
                formatTextValue={() => `${value} *C`}
                needleColor={'orange'}
            />
        </div>
    );
}
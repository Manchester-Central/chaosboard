import 'bootstrap/dist/css/bootstrap.css';
import '../App.css';
import { NtContextObject } from './nt-container';
import Moment from 'react-moment';
import { CSSProperties, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import NTManager from '../data/nt-manager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

enum UpdatedState {
    RECENT, OLD, NEVER
}

type NTConnectionDisplayWithManagerProps = {
    ntManager: NTManager,
};
function NTConnectionDisplayWithManager({ntManager}: NTConnectionDisplayWithManagerProps) {
    const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>();
    const [updateState, setUpdatedState] = useState(UpdatedState.NEVER);

    useInterval(() => {
        const updatedTime = ntManager.getlastUpdatedTime();
        if (!!updatedTime) {
            setLastUpdatedTime(updatedTime);
            setUpdatedState(new Date().getTime() - updatedTime.getTime() > 5000 ? UpdatedState.OLD : UpdatedState.RECENT);
        }
        
    }, 100);

    let getBackgroundStyle: () => CSSProperties = () => {
        const isRecent = updateState == UpdatedState.RECENT;
        return {
            color: isRecent ? 'white' : 'b;ack',
            padding: '5px 25px',
            borderRadius: 5,
            backgroundColor: isRecent ? '#00000000' : 'white',
        };
    }

    const getTimeDisplay = () => {
        switch(updateState) {
            case UpdatedState.NEVER:
                return <> never <FontAwesomeIcon icon={faWarning} /></>;
            case UpdatedState.OLD:
                return <> <Moment date={lastUpdatedTime} interval={100} fromNow withTitle titleFormat='LTS'/> <FontAwesomeIcon icon={faWarning} /></>;
            case UpdatedState.RECENT:
                return <span title={moment(lastUpdatedTime).format('LTS')}> just now <FontAwesomeIcon icon={faCheckCircle} /></span>;
        }
    }

    return (
        <div style={getBackgroundStyle()} className={updateState == UpdatedState.RECENT ? '' : 'blink text-danger'}>
            <small>Last Updated: { getTimeDisplay() }</small>
        </div>
    );
}

function NTConnectionDisplay() {
    return (
        <NtContextObject.Consumer>
            {context => <NTConnectionDisplayWithManager ntManager={context} />}
        </NtContextObject.Consumer>
    );
}

export { NTConnectionDisplay as default };


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.css';
import update from 'immutability-helper';
import { useCallback, useEffect, useState } from 'react';
import { DraggableData, Rnd } from 'react-rnd';
import { Textfit } from 'react-textfit';
import '../App.css';
import { onWidgetAdded } from '../components/nt-modal';
import NTManager, { NTEntry } from '../data/nt-manager';
import { DisplayMapper, DisplayType, getConfigComponent, getDefaultType, shouldUseParentTitle } from './displays/display-mapper';
import { NtContextObject } from './nt-container';
import Modal from 'react-modal';
import Select from 'react-select'
import { HistoryManager } from '../data/history-manager';
import HistoryModal from './history-modal';

interface BoxState {
    key: string
    top: number
    left: number
    height: string
    width: string
    title: string
    zIndex: number
    displayType: DisplayType
    config?: any
}

const settingsModalStyle: Modal.Styles = {
    overlay: {
        zIndex: 99999
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      height: '75vh',
      width: '50vw',
    },
}

type BoardContainerProps = {
    manager: NTManager,
};
function BoardContainer({ manager }: BoardContainerProps) {
    const historyManager = new HistoryManager(manager);

    const [boxes, setBoxes] = useState<{
        [key: string]: BoxState
    }>(JSON.parse(localStorage.getItem('nt-boxes') ?? '{}'))

    const getNextZIndex = () => Math.max(...Object.values(boxes).map(box => box.zIndex).filter(z => Number.isSafeInteger(z)), 0) + 1;

    useEffect(() => {
        onWidgetAdded.subscribe(entry => {
            const defaultType = getDefaultType(entry);
            const title = shouldUseParentTitle(defaultType) ? entry.parentTitle : entry.title;
            boxes[entry.key] = {
                key: entry.key,
                left: 50,
                top: 50,
                title: title,
                zIndex: getNextZIndex(),
                height: '150px',
                width: '200px',
                displayType: getDefaultType(entry),
                config: {}
            }
            setBoxes(
                { ...boxes }
            )
        })
    })

    const preserveBoxes = () => {
        localStorage.setItem('nt-boxes', JSON.stringify(boxes));
    }

    useEffect(() => {
        preserveBoxes();
    }, [boxes])

    const boxDragged = useCallback((event: any, data: DraggableData) => {
        const newZIndex = getNextZIndex();
        setBoxes(
            update(boxes, {
                [data.node.id]: {
                    $merge: { left: data.x, top: data.y, zIndex: newZIndex },
                },
            }),
        )
    }, [boxes, setBoxes]);

    const boxResized = useCallback((event: any, direction: any, ref: HTMLElement) => {
        const newZIndex = getNextZIndex();
        setBoxes(
            update(boxes, {
                [ref.id]: {
                    $merge: { width: ref.style.width, height: ref.style.height, zIndex: newZIndex },
                },
            }),
        )
    }, [boxes, setBoxes]);

    const typeChanged = useCallback((key: string, type?: DisplayType) => {
        if(!type) {
            return;
        }
        const entry = manager.getEntry(key);
        const title = shouldUseParentTitle(type) ? entry?.parentTitle : entry?.title;
        setBoxes(
            update(boxes, {
                [key]: {
                    $merge: { displayType: type, title },
                },
            }),
        )
    }, [boxes, setBoxes]);

    const configChanged = useCallback((key: string, config?: any) => {
        if(!config) {
            return;
        }
        const entry = manager.getEntry(key);
        setBoxes(
            update(boxes, {
                [key]: {
                    $merge: { config: config },
                },
            }),
        )
    }, [boxes, setBoxes]);

    const boxDeleted = useCallback((key: string) => {
        const newBoxes = { ...boxes };
        delete newBoxes[key];
        setBoxes(
            newBoxes,
        )
    }, [boxes, setBoxes]);

    Modal.setAppElement('#root')

    return (
        <div>
            {Object.keys(boxes).map((key) => {
                const box = boxes[key];
                const { left, top, title, zIndex, height, width, displayType } = box;
                const entry = manager.getEntry(key);
                return (
                    <Rnd
                        id={key}
                        key={key}
                        dragHandleClassName='handle'
                        default={{
                            x: left,
                            y: top,
                            width: width,
                            height: height,
                        }}
                        onDragStop={boxDragged}
                        onResizeStop={boxResized}
                        style={{ zIndex }}
                        minWidth={150}
                        minheight={250}
                    >
                        <EntryCard entry={entry} boxState={box} config={box.config} historyManager={historyManager} boxDeleted={boxDeleted} configChanged={configChanged} typeChanged={typeChanged}/>
                    </Rnd>
                )
            })}
        </div>

    )
}

const selectOptions = Object.values(DisplayType)
.map(type => ({value: type as DisplayType, label: type}))
.sort((aType, bType) => 
    // This logic places all types starting with a [ to the end
    aType.label.startsWith("[") !== bType.label.startsWith("[")
    ? 1
    : aType.label.localeCompare(bType.label)
);

type EntryCardProps = {
    entry: NTEntry | undefined,
    historyManager: HistoryManager,
    boxState: BoxState,
    config: any,
    configChanged: (key: string, config?: any) => void,
    typeChanged: (key: string, type?: DisplayType) => void,
    boxDeleted: (key: string) => void,
}
function EntryCard({entry, historyManager, boxState, config, boxDeleted, configChanged, typeChanged} : EntryCardProps) {

    const [title, setTitle] = useState(boxState.title);
    const [displayType, setDisplayType] = useState(boxState.displayType);
    const [key, setKey] = useState(boxState.key);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const onConfigChange = (newConfig: any) => configChanged(key, newConfig);
    const [configComponent, setConfigComponent] = useState(getConfigComponent(displayType, config, onConfigChange));

    const settingsButton = <FontAwesomeIcon icon={faGear} style={{cursor: 'pointer'}} onClick={() => setIsModalOpen(true)}/>;
    const historyButton = !!entry && historyManager.hasHistory(entry) ? <HistoryModal entry={entry} historyManager={historyManager}></HistoryModal> : <></>;

    useEffect(() => {
        setTitle(boxState.title);
        setDisplayType(boxState.displayType);
        setKey(boxState.key);
    }, [boxState])

    useEffect(() => {
        setConfigComponent(getConfigComponent(displayType, config, onConfigChange));
    }, [displayType, boxState]);

    return <>
        <div className='card' style={{ height: '100%' }}>
            <div className='handle card-header' style={{ cursor: 'move', width: '100%' }}>
                <Textfit mode="single" max={20}>
                    {settingsButton} {historyButton} {title} <small style={{fontSize: '0.5em'}}>{entry?.key}</small>
                </Textfit>
            </div>
            <div className='card-body p-0' style={{overflowY: 'auto'}}>
                <DisplayMapper entry={entry} selectedDisplayType={displayType} historyManager={historyManager} configs={config}></DisplayMapper>
            </div>
        </div>
        
        <Modal isOpen={isModalOpen} style={settingsModalStyle} >
            <h1>
                {title}
            </h1>
            <hr />
            <div>
                <Select options={selectOptions} defaultValue={selectOptions.find(x => x.value === displayType)} onChange={value => typeChanged(key ?? '', value?.value)}/>
            </div>
            <hr />
            {configComponent ? <div>
                {configComponent}
                <hr />
            </div> : <></>}
            <div className="d-grid gap-2 d-md-block">
                <button onClick={() => boxDeleted(key)} className='btn btn-block btn-danger'>Delete</button>
                <button onClick={() => setIsModalOpen(false)} className='btn btn-chaos ms-2'>Close</button>
            </div>
            
        </Modal>
    </>;
}

function BoardContainerWrapper() {

    return (
        <NtContextObject.Consumer>
            {context => <BoardContainer manager={context}></BoardContainer>}
        </NtContextObject.Consumer>
    );
}

export default BoardContainerWrapper;
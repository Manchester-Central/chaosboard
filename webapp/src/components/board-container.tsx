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
import { DisplayMapper, DisplayType, getDefaultType } from './displays/display-mapper';
import { NtContextObject } from './nt-container';
import Modal from 'react-modal';
import Select from 'react-select'

interface BoxState {
    key: string
    top: number
    left: number
    height: string
    width: string
    title: string
    zIndex: number
    displayType: DisplayType
}

const modalStyle: Modal.Styles = {
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
      height: '400px',
      width: '400px',
    },
}

type BoardContainerProps = {
    manager: NTManager,
};
function BoardContainer({ manager }: BoardContainerProps) {
    const [boxes, setBoxes] = useState<{
        [key: string]: BoxState
    }>(JSON.parse(localStorage.getItem('nt-boxes') ?? '{}'))

    const getNextZIndex = () => Math.max(...Object.values(boxes).map(box => box.zIndex).filter(z => Number.isSafeInteger(z)), 0) + 1;

    useEffect(() => {
        onWidgetAdded.subscribe(entry => {
            boxes[entry.key] = {
                key: entry.key,
                left: 50,
                top: 50,
                title: entry.title,
                zIndex: getNextZIndex(),
                height: '150px',
                width: '200px',
                displayType: getDefaultType(entry)
            }
            setBoxes(
                { ...boxes }
            )
        })
    })

    useEffect(() => {
        localStorage.setItem('nt-boxes', JSON.stringify(boxes));
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
        setBoxes(
            update(boxes, {
                [key]: {
                    $merge: { displayType: type },
                },
            }),
        )
    }, []);

    const boxDeleted = useCallback((key: string) => {
        delete boxes[key]
        setBoxes(
            boxes
        )
        setModalBoxState(undefined)
    }, []);

    const [modalBoxState, setModalBoxState] = useState<BoxState | undefined>();

    Modal.setAppElement('#root')

    const selectOptions = Object.values(DisplayType).map(type => ({value: type as DisplayType, label: type}));

    return (
        <div>
            {Object.keys(boxes).map((key) => {
                const box = boxes[key];
                const { left, top, title, zIndex, height, width, displayType } = box
                const entry = manager.getEntry(key);
                return (
                    <Rnd
                        id={key}
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
                        <div className='card' style={{ height: '100%' }}>
                            <div className='handle card-header' style={{ cursor: 'move', width: '100%' }}>
                                <Textfit mode="single" max={20}>
                                    <FontAwesomeIcon icon={faGear} style={{cursor: 'pointer'}} onClick={() => setModalBoxState(box)}/> {title} <small style={{fontSize: '0.5em'}}>{key}</small>
                                </Textfit>
                            </div>
                            <div className='card-body d-flex justify-content-center align-items-center p-0'>
                                <DisplayMapper entry={entry} selectedDisplayType={displayType}></DisplayMapper>
                            </div>
                        </div>
                    </Rnd>
                )
            })}
            <Modal isOpen={!!modalBoxState} style={modalStyle}>
                <h1>
                    {modalBoxState?.title}
                </h1>
                <div>
                    <Select options={selectOptions} defaultValue={selectOptions.find(x => x.value === modalBoxState?.displayType)} onChange={value => typeChanged(modalBoxState?.key ?? '', value?.value)}/>
                </div>
                <div className="d-grid gap-2 d-md-block mt-5">
                    <button onClick={() => boxDeleted(modalBoxState?.key ?? '')} className='btn btn-block btn-danger'>Delete</button>
                    <button onClick={() => setModalBoxState(undefined)} className='btn btn-chaos ms-2'>Close</button>
                </div>
                
            </Modal>
        </div>

    )
}

function BoardContainerWrapper() {

    return (
        <NtContextObject.Consumer>
            {context => <BoardContainer manager={context}></BoardContainer>}
        </NtContextObject.Consumer>
    );
}

export default BoardContainerWrapper;
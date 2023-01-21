import 'bootstrap/dist/css/bootstrap.css';
import '../App.css';
import NTManager, { NTEntry } from '../data/nt-manager';
import { NtContextObject } from './nt-container';
import { onWidgetAdded } from '../components/nt-modal';
import { useCallback, useEffect, useState } from 'react';
import useNtEntry from '../hooks/useNtEntry';
import update from 'immutability-helper';
import { Rnd, DraggableData } from 'react-rnd';
import { Textfit } from 'react-textfit';

type SimpleDisplayProps = {
    entry: NTEntry | undefined,
};
function SimpleDisplay({ entry }: SimpleDisplayProps) {
    
    let value = useNtEntry(entry);

    return (
        <div style={{width: '100%'}}>
            
      <Textfit mode="single">
      {value?.toString()}
      </Textfit></div>
    );
}

export interface ContainerState {
    boxes: { [key: string]: { top: number; left: number; title: string } }
}

interface BoxState {
    top: number
    left: number
    height: string
    width: string
    title: string
    zIndex: number
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
                left: 50,
                top: 50,
                title: entry.key,
                zIndex: getNextZIndex(),
                height: '100px',
                width: '100px',
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


    return (
        <div>
            {Object.keys(boxes).map((key) => {
                const { left, top, title, zIndex, height, width } = boxes[key]
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
                    >
                        <div className='card' style={{ height: '100%' }}>
                            <div className='handle card-header' style={{ cursor: 'move' }}>
                                {title}
                            </div>
                            <div className='card-body d-flex justify-content-center align-items-center'><SimpleDisplay entry={manager.getEntry(key)}></SimpleDisplay></div>

                        </div>
                    </Rnd>
                )
            })}
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
import 'bootstrap/dist/css/bootstrap.css';
import '../App.css';
import NTManager, { NTEntry } from '../data/nt-manager';
import { NtContextObject } from './nt-container';
import { onWidgetAdded } from '../components/nt-modal';
import { useCallback, useEffect, useState } from 'react';
import useNtEntry from '../hooks/useNtEntry';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { XYCoord } from 'react-dnd';
import update from 'immutability-helper';

import type { CSSProperties, FC, ReactNode } from 'react'

const boxStyles: CSSProperties = {
    position: 'absolute',
    //border: '1px dashed gray',
    backgroundColor: 'white',
    //cursor: 'move',
    //maxWidth: '300px',
}

const headerStyles: CSSProperties = {
    cursor: 'move',
}

export interface BoxProps {
    id: any
    left: number
    top: number
    zIndex: number
    hideSourceOnDrag?: boolean
    children?: ReactNode
}

export const Box: FC<BoxProps> = ({
    id,
    left,
    top,
    zIndex,
    hideSourceOnDrag,
    children,
}) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'nt',
            item: { id, left, top },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top],
    )

    if (isDragging && hideSourceOnDrag) {
        return <div ref={drag} />
    }
    return (
        <div
            className="card text-center"
            style={{ ...boxStyles, left, top, zIndex }}
            data-testid="box"
        >
        <div className="card-header text-muted fs-6" ref={drag} style={headerStyles}>
            <small>{id}</small>
        </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    )
}

type SimpleDisplayProps = {
    entry: NTEntry | undefined,
};
function SimpleDisplay({ entry }: SimpleDisplayProps) {
    let value = useNtEntry(entry);

    return (
        <>{value?.toString()}</>
    );
}

const bowWrapperStyles: CSSProperties = {
    width: '100vw',
    height: 'calc(100vh - 56px)',
    border: '1px solid black',
    position: 'relative',
}

export interface ContainerState {
    boxes: { [key: string]: { top: number; left: number; title: string } }
}

type BoardContainerProps = {
    manager: NTManager,
    hideSourceOnDrag: boolean,
};
function BoardContainer({ manager, hideSourceOnDrag }: BoardContainerProps) {
    const [boxes, setBoxes] = useState<{
        [key: string]: {
            top: number
            left: number
            title: string
            zIndex: number
        }
    }>(JSON.parse(localStorage.getItem('nt-boxes') ?? '{}'))

    const getNextZIndex = () => Math.max(...Object.values(boxes).map(box => box.zIndex).filter(z => Number.isSafeInteger(z)), 0) + 1;

    useEffect(() => {
        onWidgetAdded.subscribe(entry => {
            boxes[entry.key] = {
                left: 50,
                top: 50,
                title: entry.key,
                zIndex: getNextZIndex()
                // TODO: Add high z index so new items are on top
            }
            setBoxes(
                { ...boxes }
            )
        })
    })

    useEffect(() => {
        localStorage.setItem('nt-boxes', JSON.stringify(boxes));
    }, [boxes])

    const moveBox = useCallback(
        (id: string, left: number, top: number) => {
            const newZIndex = getNextZIndex();
            console.log(newZIndex, Object.values(boxes).map(box => box.zIndex));
            setBoxes(
                update(boxes, {
                    [id]: {
                        $merge: { left, top, zIndex: newZIndex },
                    },
                }),
            )
        },
        [boxes, setBoxes],
    )
    interface DragItem {
        type: string
        id: string
        top: number
        left: number
    }

    const [, drop] = useDrop(
        () => ({
            accept: 'nt',
            drop(item: DragItem, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset() as XYCoord
                const left = Math.round(item.left + delta.x)
                const top = Math.round(item.top + delta.y)
                moveBox(item.id, left, top)
                return undefined
            },
        }),
        [moveBox],
    )
    console.log(boxes);

    return (
        <div ref={drop} style={bowWrapperStyles}>
            {Object.keys(boxes).map((key) => {
                const { left, top, title, zIndex } = boxes[key] as {
                    top: number
                    left: number
                    title: string
                    zIndex: number
                }
                return (
                    <Box
                        key={key}
                        id={key}
                        left={left}
                        top={top}
                        zIndex={zIndex}
                        hideSourceOnDrag={hideSourceOnDrag}
                    >
                        <div>
                            <SimpleDisplay entry={manager.getEntry(key)}></SimpleDisplay>
                        </div>
                    </Box>
                )
            })}
        </div>
    )
}

function BoardContainerWrapper() {

    return (
        <NtContextObject.Consumer>
            {context => <DndProvider backend={HTML5Backend}>
                <BoardContainer manager={context} hideSourceOnDrag={true}></BoardContainer>
            </DndProvider>}

        </NtContextObject.Consumer>
    );
}

export default BoardContainerWrapper;
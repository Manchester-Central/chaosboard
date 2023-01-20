import 'bootstrap/dist/css/bootstrap.css';
import '../App.css';
import NTManager, { NTEntry } from '../data/nt-manager';
import { NtContextObject } from './nt-container';
import { onWidgetAdded } from '../components/nt-modal';
import { useCallback, useEffect, useState } from 'react';
import useNtEntry from '../hooks/useNtEntry';
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { XYCoord } from 'react-dnd'
import update from 'immutability-helper'

import type { CSSProperties, FC, ReactNode } from 'react'

const style: CSSProperties = {
    position: 'absolute',
    border: '1px dashed gray',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    cursor: 'move',
}

export interface BoxProps {
    id: any
    left: number
    top: number
    hideSourceOnDrag?: boolean
    children?: ReactNode
}

export const Box: FC<BoxProps> = ({
    id,
    left,
    top,
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
            className="box"
            ref={drag}
            style={{ ...style, left, top }}
            data-testid="box"
        >
            {children}
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

const ItemTypes = {
    NT: 'nt',
}

const styles: CSSProperties = {
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
        }
    }>(JSON.parse(localStorage.getItem('nt-boxes') ?? '{}'))

    useEffect(() => {
        onWidgetAdded.subscribe(entry => {
            boxes[entry.key] = {
                left: 50,
                top: 50,
                title: entry.key
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
            setBoxes(
                update(boxes, {
                    [id]: {
                        $merge: { left, top },
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
        <div ref={drop} style={styles}>
            {Object.keys(boxes).map((key) => {
                const { left, top, title } = boxes[key] as {
                    top: number
                    left: number
                    title: string
                }
                return (
                    <Box
                        key={key}
                        id={key}
                        left={left}
                        top={top}
                        hideSourceOnDrag={hideSourceOnDrag}
                    >
                        <span>{title}</span>
                        <SimpleDisplay entry={manager.getEntry(key)}></SimpleDisplay>
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
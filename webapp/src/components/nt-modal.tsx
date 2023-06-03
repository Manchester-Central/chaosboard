import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Subject } from 'rxjs';
import '../App.css';
import NTManager, { NetworkTableTree, NTEntry } from '../data/nt-manager';
import useNtEntry from '../hooks/useNtEntry';
import { NtContextObject } from './nt-container';

const onWidgetAddedSubject = new Subject<NTEntry>();
const onWidgetAdded = onWidgetAddedSubject.asObservable();

type TableRowProps = {
    node: NetworkTableTree,
    entry?: NTEntry,
    level: number
};
function TableRow({ node, entry, level }: TableRowProps) {

    let [value] = useNtEntry(entry);

    return (
        <tr key={entry?.key}>
            <td style={{ width: '50px' }}>{entry ? <button className='btn btn-dark btn-chaos btn-sm' onClick={() => onWidgetAddedSubject.next(entry)}><FontAwesomeIcon icon={faAdd} /></button> : <></>}</td>
            <td style={{ paddingLeft: level * 20 + 'px', width: '20%' }}>{node?.key}</td>
            <td style={{ width: '50%', maxWidth: '50%' }}>{(value?.toString() as string)?.split(',').map(a => <p>{a}</p>)}</td>
            <td style={{ width: '20%' }}>{entry?.latestValue?.valueType?.toString()}</td>
        </tr>
    );
}

type TableBodyProps = {
    manager: NTManager,
};
function TableBody({ manager }: TableBodyProps) {
    const [data, setData] = useState(manager.tree.children);
    const [latestUpdate, setLatestUpdate] = useState<NTEntry>();

    manager.onNewValue.subscribe(update => {
        setLatestUpdate(update);
    });

    const renderTree = (nodes: Map<string, NetworkTableTree>, level = 0) => (
        Array.from(nodes.values()).map(node => renderNode(node, level))
    );

    const renderNode = (node: NetworkTableTree, level: number): any => (
        <>
            <TableRow node={node} entry={node.entry} level={level}></TableRow>
            {node.children.size > 0 ? renderTree(node.children, level + 1) : null}
        </>
    );

    return (
        <table className='table Value-Table'>
            <thead>
                <tr>
                    <th></th>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {renderTree(data)}
            </tbody>
        </table>
    );
}

const styles: Modal.Styles = {
    overlay: {
        zIndex: 99999
    }
}

function NTModal() {
    const [isModalOpen, setModalOpen] = useState(false);

    Modal.setAppElement('#root')

    useEffect(() => {
        const sub = onWidgetAdded.subscribe(() => setModalOpen(false));
        return () => sub.unsubscribe();
    })

    let reset = () => {
        localStorage.removeItem('nt-boxes');
        window.location.reload();
    }

    return (
        <div id='ntModal'>
            <button onClick={() => setModalOpen(true)} className='btn btn-dark btn-chaos'><FontAwesomeIcon icon={faAdd} /> Widget</button>
            <Modal isOpen={isModalOpen} style={styles}>
                <div className="sticky-top d-flex" style={{backgroundColor: 'white'}}>
                    <h1 className="flex-fill">Network Table Entries</h1>
                    <button onClick={() => reset()} className='btn btn-danger'>Clear All</button>
                    <button onClick={() => setModalOpen(false)} className='btn btn-dark btn-chaos ms-2'>Close</button>
                </div>
                <NtContextObject.Consumer>
                    {context => <TableBody manager={context}></TableBody>}
                </NtContextObject.Consumer>
            </Modal>
        </div>
    );
}

export { NTModal as default, onWidgetAdded };


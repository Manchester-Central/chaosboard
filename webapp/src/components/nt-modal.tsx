import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import NTManager, { NetworkTableTree, NTEntry } from '../data/nt-manager';
import '../App.css';
import { NtContextObject } from './nt-container';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd } from '@fortawesome/free-solid-svg-icons'

type TableRowProps = {
    node: NetworkTableTree,
    entry?: NTEntry,
    level: number
};
function TableRow({node, entry, level}: TableRowProps) {
    const [value, setValue] = useState(entry?.latestValue?.value);

    useEffect(() => {
        const sub = entry?.onUpdated.subscribe(update => {
            setValue(update?.value);
        });
        return () => sub?.unsubscribe();
    })

    return (
        <tr key={entry?.key}>
            <td style={{ paddingLeft: level * 20 + 'px' }}>{node?.key}</td>
            <td>{value?.toString()}</td>
        </tr>
    );
}

type TableBodyProps = {
    manager: NTManager,
};
function TableBody({manager}: TableBodyProps) {
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
                    <th>Key</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {renderTree(data)}
            </tbody>
        </table>
    );
}

function NTModal() {
    const [isModalOpen, setModalOpen] = useState(false);

    Modal.setAppElement('#root')
    
    return (
        <div id='ntModal'>
            <button onClick={() => setModalOpen(true)} className='btn btn-chaos'><FontAwesomeIcon icon={faAdd} /> Widget</button>
            <Modal isOpen={isModalOpen}>
                <button onClick={() => setModalOpen(false)}>Close</button>
                <NtContextObject.Consumer>
                    {context => <TableBody manager={context}></TableBody>}
                </NtContextObject.Consumer>
            </Modal>
        </div>
    );
}

export default NTModal;
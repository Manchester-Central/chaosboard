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
    level: number,
};
function TableRow({ node, entry, level }: TableRowProps) {

    let [value] = useNtEntry(entry);

    return (
        <div style={{display: 'flex', borderBottom: '1px solid gray'}} className='nt-table-row' key={entry?.key}>
            <div style={{ width: '50px' }}>{entry ? <button className='btn btn-dark btn-chaos btn-sm' onClick={() => onWidgetAddedSubject.next(entry)}><FontAwesomeIcon icon={faAdd} /></button> : <></>}</div>
            <div style={{ paddingLeft: level * 20 + 'px', width: '30%', maxWidth: '30%', overflowX: 'auto', fontWeight: value !== undefined ? 'bolder' : 'normal' }}>{node?.key}</div>
            <div style={{ flexGrow: 1, overflowX: 'auto' }}>{(value?.toString() as string)?.split(',').map(a => <span>{a}<br/></span>)}</div>
        </div>
    );
}

type TableBodyProps = {
    manager: NTManager,
    filterText: string,
};
function TableBody({ manager, filterText }: TableBodyProps) {
    const [data, setData] = useState(manager.tree.children);
    const [latestUpdate, setLatestUpdate] = useState<NTEntry>();

    manager.onNewValue.subscribe(update => {
        setLatestUpdate(update);
    });

    const renderTree = (nodes: Map<string, NetworkTableTree>, level = 0) => (
        Array.from(nodes.values()).map(node => renderNode(node, level))
    );

    const renderNode = (node: NetworkTableTree, level: number): any => {
        const shouldShow = node.shouldShow(filterText);
        if(!shouldShow) {
            return <></>
        }
        return (<>
            <TableRow node={node} entry={node.entry} level={level}></TableRow>
            {node.children.size > 0 ? renderTree(node.children, level + 1) : null}
        </>)
    };

    return (
        <div style={{flexGrow: 1, maxHeight: "100%", overflowY: 'auto' }}>
            {renderTree(data)}
        </div>
    );
}

const styles: Modal.Styles = {
    overlay: {
        zIndex: 99999
    }
}

function NTModal() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [filterText, setFilterText] = useState('');

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
                <div style={{display: 'flex', flexDirection: 'column', minHeight: '100%', maxHeight: '100%', gap: 10}}>
                    <div style={{display: 'flex', backgroundColor: 'white'}}>
                        <h1 className="flex-fill">Network Table Entries</h1>
                        <button onClick={() => reset()} className='btn btn-danger'>Clear All</button>
                        <button onClick={() => setModalOpen(false)} className='btn btn-dark btn-chaos ms-2'>Close</button>
                    </div>
                    <NtContextObject.Consumer>
                        {context => <TableBody manager={context} filterText={filterText}></TableBody>}
                    </NtContextObject.Consumer>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Filter</span>
                        <input type="text" className="form-control" placeholder="Filter for certain keys here..." value={filterText} onChange={e => setFilterText(e.target.value)}/>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export { NTModal as default, onWidgetAdded };


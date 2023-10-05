import { faAdd, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
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

type EntryRowProps = {
    node: NetworkTableTree,
    entry?: NTEntry,
};
function EntryRow({ node, entry }: EntryRowProps) {

    let [value] = useNtEntry(entry);

    return (
        <div style={{display: 'flex', gap: 10, borderBottom: '1px solid gray'}}>
            <div><button className='btn btn-chaos'>+</button></div>
            <div style={{flexGrow: 1}}><strong>{node.key}</strong></div>
            <div style={{width: '75vw'}}><span>{value ?? ''}</span></div>
        </div>
    );
}

type TreeViewWrapperProps = {
    manager: NTManager,
    filterText: string,
};
function TreeViewWrapper({ manager, filterText }: TreeViewWrapperProps) {
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
        return (
            <TreeItem nodeId={node.keyPath} key={node.keyPath} label={node.key} hidden={!shouldShow} ContentComponent={node.entry ? () => <EntryRow entry={node.entry} node={node}/> : undefined}>
                {node.children.size > 0 ? renderTree(node.children, level + 1) : null}
            </TreeItem>
        )
    };

    return (
        <TreeView defaultExpanded={manager.getAllKeys()}
            defaultCollapseIcon={<FontAwesomeIcon icon={faChevronDown} />}
            defaultExpandIcon={<FontAwesomeIcon icon={faChevronRight} />}
            sx={{ flexGrow: 1, maxHeight: "100%", overflowY: 'auto' }} 
        >
            {renderTree(data)}
        </TreeView>
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
                        {context => <TreeViewWrapper manager={context} filterText={filterText}></TreeViewWrapper>}
                    </NtContextObject.Consumer>
                    <div className="input-group mb-3">
                        <span className="input-group-text">Filter</span>
                        <input type="text" className="form-control" placeholder="Filter for certain keys here..." onChange={e => setFilterText(e.target.value)}/>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export { NTModal as default, onWidgetAdded };


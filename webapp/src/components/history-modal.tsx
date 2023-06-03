import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Modal from 'react-modal';
import { HistoryManager } from "../data/history-manager";
import { NTEntry } from "../data/nt-manager";
import useNtEntry from "../hooks/useNtEntry";

const modalStyles: Modal.Styles = {
    overlay: {
        zIndex: 99999
    },
    content: {
    },
}
type HistoryModalProps = {
    entry: NTEntry,
    historyManager: HistoryManager
};
function HistoryModal({entry, historyManager} : HistoryModalProps) {
    const [isModalOpen, setModalOpen] = useState(false);

    const [_, updateValue] = useNtEntry(entry);

    Modal.setAppElement('#root')

    const formatHistoryValue = (value: any | any[]) => {
        const values = Array.isArray(value) ? value : [value];
        return <ul className="list-group list-group-flush">{values.map(v => <li className="list-group-item" style={{paddingTop: 2, paddingBottom: 2}}>{v}</li>)}</ul>
    }

    const revert = (oldValue: any) => {
        updateValue(oldValue, historyManager);
        setModalOpen(false);
    }

    return (
        <>
            <FontAwesomeIcon icon={faHistory} onClick={() => setModalOpen(true)} style={{cursor: 'pointer'}}></FontAwesomeIcon>
            <Modal isOpen={isModalOpen} style={modalStyles}>
                <div className="sticky-top d-flex" style={{backgroundColor: 'white'}}>
                    <h1 className="flex-fill">History - {entry?.title}</h1>
                    <button onClick={() => {historyManager.clearHistory(entry); setModalOpen(false)}} className='btn btn-block btn-danger'>Clear History</button>
                    <button onClick={() => setModalOpen(false)} className='btn btn-block btn-chaos ms-2'>Close</button>
                </div>
                <div>
                    <table className='table table-striped'>
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Time</th>
                                <th style={{ width: '50%', maxWidth: '50%' }}>Value</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyManager.getHistory(entry).map(historyRecord => (<tr>
                                <td>{historyRecord.label}</td>
                                <td>{new Date(historyRecord.timestamp).toLocaleString()}</td>
                                <td>{formatHistoryValue(historyRecord.value)}</td>
                                <td><button onClick={() => revert(historyRecord.value)} className='btn btn-dark ms-2'>Revert</button></td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
    );
}

export { HistoryModal as default };
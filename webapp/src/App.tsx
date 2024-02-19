import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import './App.css';
import BoardContainerWrapper from './components/board-container';
import NtContainer from './components/nt-container';
import NTModal from './components/nt-modal';
import NTConnectionDisplay from './components/nt-connection-display';

function App() {
  return (
    <NtContainer>
      <nav className="navbar navbar-chaos navbar-dark navbar-expand-lg">
        <div className='container-fluid'>
          <a className="navbar-brand">
            <img src="/ChaosLogo.png" height="30" className="d-inline-block align-top me-1" alt=""></img>
            <span>Board</span>
          </a>
          <NTConnectionDisplay />
          <NTModal />
        </div>
      </nav>
      <BoardContainerWrapper />
    </NtContainer>
  );
}

export default App;

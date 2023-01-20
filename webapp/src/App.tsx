import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NtContainer from './components/nt-container';
import NTModal from './components/nt-modal';

function App() {
  return (
    <NtContainer>
      <nav className="navbar navbar-chaos navbar-dark navbar-expand-lg">
        <div className='container-fluid'>
          <a className="navbar-brand">
            <img src="/ChaosLogo.png" height="30" className="d-inline-block align-top me-1" alt=""></img>
            <span>Board</span>
          </a>
          <NTModal></NTModal>
        </div>
      </nav>
    </NtContainer>
  );
}

export default App;

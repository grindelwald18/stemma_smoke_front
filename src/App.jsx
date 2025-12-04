import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlanogramList from './pages/PlanogramList.jsx';
import PlanogramForm from './pages/PlanogramForm.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/planograms" element={<PlanogramList />} />
          <Route path="/planograms/new" element={<PlanogramForm />} />
          <Route path="/planograms/:id/edit" element={<PlanogramForm />} />
          <Route path="/" element={<Navigate to="/planograms" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

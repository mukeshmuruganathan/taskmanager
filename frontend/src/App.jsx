import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <Router>
            <Toaster position="top-center" />
            <Routes>
                <Route path="/*" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;

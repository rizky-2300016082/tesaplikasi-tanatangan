import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import EditDocumentPage from './pages/EditDocumentPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" /> 
      
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/document/:documentId/edit" element={<EditDocumentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
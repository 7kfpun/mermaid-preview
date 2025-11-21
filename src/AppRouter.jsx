import { Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import GalleryPage from './pages/GalleryPage.jsx';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/gallery" element={<GalleryPage />} />
    </Routes>
  );
}

export default AppRouter;

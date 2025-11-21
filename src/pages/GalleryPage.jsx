import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Gallery from '../components/Gallery';
import useTheme from '../hooks/useTheme';
import '../App.css';

function GalleryPage() {
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    // Apply dark mode class to body
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Toaster />
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <Gallery />
      <Footer />
    </div>
  );
}

export default GalleryPage;

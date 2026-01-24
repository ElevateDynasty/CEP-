import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import IdentifyPage from './pages/IdentifyPage';
import ExplorePage from './pages/ExplorePage';
import BreedDetailPage from './pages/BreedDetailPage';
import ComparePage from './pages/ComparePage';
import MapPage from './pages/MapPage';
import SchemesPage from './pages/SchemesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-bg flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/identify" element={<IdentifyPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/breed/:breedId" element={<BreedDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;

import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🐄</span>
              <span className="font-bold text-xl text-white">BreedID India</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered identification system for indigenous Indian cattle and buffalo breeds. 
              Supporting farmers with breed information, sustainability metrics, and government schemes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/identify" className="hover:text-white transition-colors">
                  Identify Breed
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Breeds
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Breed Map
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-white transition-colors">
                  Govt Schemes
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://dahd.nic.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  DAHD Portal
                </a>
              </li>
              <li>
                <a 
                  href="https://nbagr.icar.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ICAR-NBAGR
                </a>
              </li>
              <li>
                <a 
                  href="https://epashuhaat.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  e-Pashuhaat
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-white transition-colors"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 BreedID India. Open source project for Indian livestock conservation.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart size={14} className="mx-1 text-red-500" /> for Indian farmers
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ExternalLink, 
  Search, 
  Users, 
  IndianRupee,
  CheckCircle,
  Building2
} from 'lucide-react';
import breedData from '../data/breedData';

export default function SchemesPage() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScheme, setExpandedScheme] = useState(null);

  const schemes = breedData.governmentSchemes || [];

  const filteredSchemes = schemes.filter((scheme) => {
    const query = searchQuery.toLowerCase();
    return (
      scheme.name.toLowerCase().includes(query) ||
      scheme.description.toLowerCase().includes(query) ||
      scheme.benefits?.some((b) => b.toLowerCase().includes(query))
    );
  });

  const toggleExpand = (id) => {
    setExpandedScheme(expandedScheme === id ? null : id);
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <Building2 className="text-primary-600" />
            <span>{t('schemes.title')}</span>
          </h1>
          <p className="text-gray-600 mt-2">{t('schemes.subtitle')}</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('schemes.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <IndianRupee className="text-primary-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Financial Support for Farmers</h3>
              <p className="text-gray-600 text-sm mt-1">
                The Government of India provides various schemes to support indigenous cattle and buffalo 
                breed conservation. These schemes offer financial assistance, training, and infrastructure support.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Schemes List */}
        <div className="space-y-4">
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No schemes found matching your search.</p>
            </div>
          ) : (
            filteredSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(scheme.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{scheme.name}</h3>
                      {i18n.language === 'hi' && scheme.nameHindi && (
                        <p className="text-primary-600 font-hindi">{scheme.nameHindi}</p>
                      )}
                      <p className="text-gray-600 text-sm mt-2">{scheme.description}</p>
                    </div>
                    <div className={`transform transition-transform ${expandedScheme === scheme.id ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedScheme === scheme.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100 p-6 bg-gray-50"
                  >
                    {/* Benefits */}
                    {scheme.benefits && scheme.benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <CheckCircle className="text-green-500" size={18} />
                          <span>Key Benefits</span>
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {scheme.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Eligibility */}
                    {scheme.eligibility && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <Users className="text-blue-500" size={18} />
                          <span>Eligibility</span>
                        </h4>
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                          {scheme.eligibility}
                        </p>
                      </div>
                    )}

                    {/* Website Link */}
                    {scheme.website && (
                      <a
                        href={scheme.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <span>Visit Official Website</span>
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://dahd.nic.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
            >
              <div className="p-3 bg-primary-100 rounded-lg">
                <Building2 className="text-primary-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">DAHD</h3>
                <p className="text-sm text-gray-600">Department of Animal Husbandry & Dairying</p>
              </div>
              <ExternalLink className="text-gray-400" size={18} />
            </a>

            <a
              href="https://www.nddb.coop/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">NDDB</h3>
                <p className="text-sm text-gray-600">National Dairy Development Board</p>
              </div>
              <ExternalLink className="text-gray-400" size={18} />
            </a>

            <a
              href="https://nbagr.icar.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">NBAGR</h3>
                <p className="text-sm text-gray-600">National Bureau of Animal Genetic Resources</p>
              </div>
              <ExternalLink className="text-gray-400" size={18} />
            </a>

            <a
              href="https://icar.org.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
            >
              <div className="p-3 bg-amber-100 rounded-lg">
                <Building2 className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">ICAR</h3>
                <p className="text-sm text-gray-600">Indian Council of Agricultural Research</p>
              </div>
              <ExternalLink className="text-gray-400" size={18} />
            </a>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card p-6 bg-gradient-to-r from-gray-50 to-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Contact your local veterinary officer or district animal husbandry office for assistance 
            with scheme applications and more information about breed conservation in your area.
          </p>
          <p className="text-sm text-gray-500">
            National Helpline: <span className="font-medium text-primary-600">1800-180-1551</span> (Toll Free)
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Brain, 
  Leaf, 
  Users, 
  ArrowRight,
  Sparkles,
  Map,
  Volume2
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    titleKey: 'features.ai.title',
    descKey: 'features.ai.desc',
    color: 'primary'
  },
  {
    icon: Sparkles,
    titleKey: 'features.explainable.title',
    descKey: 'features.explainable.desc',
    color: 'accent'
  },
  {
    icon: Leaf,
    titleKey: 'features.sustainability.title',
    descKey: 'features.sustainability.desc',
    color: 'green'
  },
  {
    icon: Users,
    titleKey: 'features.advisory.title',
    descKey: 'features.advisory.desc',
    color: 'blue'
  }
];

const stats = [
  { value: '50+', label: 'Indigenous Breeds' },
  { value: '24', label: 'Indian States' },
  { value: '95%', label: 'Accuracy' },
  { value: '5+', label: 'Govt Schemes' }
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('home.title')}
                <span className="block gradient-text">{t('home.titleHighlight')}</span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                {t('home.subtitle')}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/identify" className="btn-primary flex items-center space-x-2">
                  <Camera size={20} />
                  <span>{t('home.cta')}</span>
                </Link>
                <Link to="/explore" className="btn-secondary flex items-center space-x-2">
                  <span>{t('home.exploreCta')}</span>
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</p>
                    <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 shadow-lg animate-float">
                        <span className="text-5xl">🐄</span>
                        <p className="mt-2 font-semibold text-gray-700">Gir</p>
                        <p className="text-sm text-gray-500">Gujarat</p>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                        <span className="text-5xl">🐃</span>
                        <p className="mt-2 font-semibold text-gray-700">Murrah</p>
                        <p className="text-sm text-gray-500">Haryana</p>
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="bg-white rounded-2xl p-4 shadow-lg animate-float" style={{ animationDelay: '0.25s' }}>
                        <span className="text-5xl">🐄</span>
                        <p className="mt-2 font-semibold text-gray-700">Sahiwal</p>
                        <p className="text-sm text-gray-500">Punjab</p>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-lg animate-float" style={{ animationDelay: '0.75s' }}>
                        <span className="text-5xl">🐃</span>
                        <p className="mt-2 font-semibold text-gray-700">Mehsana</p>
                        <p className="text-sm text-gray-500">Gujarat</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full filter blur-3xl opacity-30" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent-200 rounded-full filter blur-3xl opacity-30" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge AI technology and designed for Indian farmers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card-hover p-6"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                    <Icon className={`text-${feature.color}-600`} size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t(feature.descKey)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Unique Features Highlight */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-6 bg-gradient-to-br from-blue-50 to-white"
            >
              <Map className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive India Map</h3>
              <p className="text-gray-600 mb-4">
                Explore breeds by their native Indian states. Click on any state to discover indigenous breeds.
              </p>
              <Link to="/map" className="text-blue-600 font-medium flex items-center space-x-1 hover:text-blue-700">
                <span>Explore Map</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Hindi Voice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card p-6 bg-gradient-to-br from-accent-50 to-white"
            >
              <Volume2 className="text-accent-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hindi Voice Support</h3>
              <p className="text-gray-600 mb-4">
                Get breed information read aloud in Hindi. Perfect for rural accessibility and ease of use.
              </p>
              <span className="text-accent-600 font-medium font-hindi">हिंदी में सुनें</span>
            </motion.div>

            {/* Sustainability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card p-6 bg-gradient-to-br from-green-50 to-white"
            >
              <Leaf className="text-green-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability Scoring</h3>
              <p className="text-gray-600 mb-4">
                Compare breeds by carbon footprint, feed efficiency, and environmental impact metrics.
              </p>
              <Link to="/compare" className="text-green-600 font-medium flex items-center space-x-1 hover:text-green-700">
                <span>Compare Breeds</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Identify Your Cattle or Buffalo Breed?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Upload an image and get instant AI-powered breed identification with detailed information.
            </p>
            <Link
              to="/identify"
              className="inline-flex items-center space-x-2 bg-white text-primary-700 font-semibold py-4 px-8 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              <Camera size={20} />
              <span>Start Identifying</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Type, Sparkles, ArrowRight } from 'lucide-react';
import { SearchMode } from '../App';

interface HeroProps {
  onModeSelect: (mode: SearchMode) => void;
}

const Hero: React.FC<HeroProps> = ({ onModeSelect }) => {
  const searchModes = [
    {
      mode: 'image' as SearchMode,
      icon: Camera,
      title: 'Style from Photo',
      description: 'Upload your photo and let AI find matching fashion pieces',
      gradient: 'from-blue-500 to-purple-600',
      hoverGradient: 'from-blue-600 to-purple-700'
    },
    {
      mode: 'voice' as SearchMode,
      icon: Mic,
      title: 'Voice Search',
      description: 'Describe your style in words and discover perfect matches',
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'from-emerald-600 to-teal-700'
    },
    {
      mode: 'text' as SearchMode,
      icon: Type,
      title: 'Text Search',
      description: 'Type what you\'re looking for with natural language',
      gradient: 'from-orange-500 to-red-600',
      hoverGradient: 'from-orange-600 to-red-700'
    }
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Fashion Discovery
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Style Match
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionary AI technology analyzes your photos, understands your voice, and discovers 
            fashion pieces that perfectly complement your unique style and current trends.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {searchModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.mode}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => onModeSelect(mode.mode)}
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  {/* Hover Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {mode.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {mode.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm">
            Powered by advanced AI • Object detection • Style matching • Trend analysis
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
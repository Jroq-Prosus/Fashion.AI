import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Volume2, Sparkles } from 'lucide-react';

interface VoiceInterfaceProps {
  onSearch: () => void;
  isSearching: boolean;
  onBack: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onSearch,
  isSearching,
  onBack
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([]);

  // Simulate audio levels for visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      interval = setInterval(() => {
        const newLevels = Array.from({ length: 20 }, () => Math.random() * 100);
        setAudioLevels(newLevels);
      }, 100);
    } else {
      setAudioLevels([]);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript("I'm looking for a casual summer dress with floral patterns, something light and comfortable for daywear");
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Search Options
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Voice Fashion Search
        </h2>
        <p className="text-gray-600 text-lg">
          Describe your perfect outfit or style preference, and let AI find exactly what you need
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Voice Input */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center space-y-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-200'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-xl'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </motion.button>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </h3>
                <p className="text-gray-600">
                  {isListening 
                    ? 'Describe what you\'re looking for'
                    : 'Tell us about your style preferences'
                  }
                </p>
              </div>
              
              {/* Audio Visualization */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-center space-x-1 h-16"
                  >
                    {audioLevels.map((level, index) => (
                      <motion.div
                        key={index}
                        className="w-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
                        animate={{
                          height: `${Math.max(4, level * 0.4)}px`,
                        }}
                        transition={{
                          duration: 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Examples */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Try saying...</h3>
            <div className="space-y-2">
              {[
                "Find me a casual summer dress",
                "I need formal wear for a business meeting",
                "Show me bohemian style accessories",
                "Looking for vintage denim jackets"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setTranscript(example)}
                  className="w-full text-left p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Transcript and Controls */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Transcript Display */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Request</h3>
              {transcript && (
                <button
                  onClick={clearTranscript}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg">
              {transcript ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-900 leading-relaxed"
                >
                  {transcript}
                </motion.p>
              ) : (
                <p className="text-gray-400 italic">
                  Your voice input will appear here...
                </p>
              )}
            </div>
          </div>
          
          {/* Search Button */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSearch}
                disabled={isSearching}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isSearching
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSearching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Voice...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Find Fashion Matches</span>
                  </div>
                )}
              </motion.button>
            </motion.div>
          )}
          
          {/* Voice Tips */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-emerald-500" />
              Voice Tips
            </h3>
            <div className="space-y-3">
              {[
                'Speak clearly and at normal pace',
                'Mention colors, styles, or occasions',
                'Include size or fit preferences',
                'Describe the look you want to achieve'
              ].map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceInterface;
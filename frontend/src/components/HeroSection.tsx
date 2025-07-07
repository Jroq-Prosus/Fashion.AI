
import React, { useState, useRef } from 'react';
import { Search, Camera, Mic, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, image?: string, voice?: boolean) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onSearch('', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice input
    setTimeout(() => {
      setIsListening(false);
      onSearch('stylish winter jacket for women', undefined, true);
    }, 2000);
  };

  const trendTags = ['Search by trend', 'Find similar', 'Recommend a style', 'Seasonal looks', 'Color matching'];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Discover Fashion with AI
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Search using text, images, or voice. Let our AI find the perfect style matches for you.
        </p>
        
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Describe what you're looking for..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors"
                title="Upload image"
              >
                <Camera className="w-5 h-5 text-purple-600" />
              </button>
              
              <button
                onClick={handleVoiceSearch}
                className={`p-3 rounded-xl transition-colors ${
                  isListening 
                    ? 'bg-red-100 animate-pulse' 
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
                title="Voice search"
              >
                <Mic className={`w-5 h-5 ${isListening ? 'text-red-600' : 'text-blue-600'}`} />
              </button>
            </div>
            
            <button
              onClick={handleTextSearch}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {trendTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onSearch(tag)}
              className="px-4 py-2 bg-white/70 hover:bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:text-purple-600 transition-all duration-200 hover:shadow-md"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

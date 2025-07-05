import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadInterface from './components/UploadInterface';
import VoiceInterface from './components/VoiceInterface';
import ResultsDisplay from './components/ResultsDisplay';
import ProductCatalog from './components/ProductCatalog';
import Footer from './components/Footer';

export type SearchMode = 'image' | 'voice' | 'text' | null;

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  match: number;
  styleAnalysis: string;
  detectedItems: string[];
}

function App() {
  const [currentMode, setCurrentMode] = useState<SearchMode>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleModeChange = (mode: SearchMode) => {
    setCurrentMode(mode);
    setSearchResults([]);
    setUploadedImage(null);
  };

  const simulateAISearch = async (type: 'image' | 'voice', data?: any) => {
    setIsSearching(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        name: 'Minimalist Black Blazer',
        price: 189,
        image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Outerwear',
        match: 94,
        styleAnalysis: 'Perfect match for your sophisticated style. The clean lines complement your uploaded look.',
        detectedItems: ['blazer', 'formal wear']
      },
      {
        id: '2',
        name: 'Elegant Silk Scarf',
        price: 75,
        image: 'https://images.pexels.com/photos/2834009/pexels-photo-2834009.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Accessories',
        match: 89,
        styleAnalysis: 'Adds a touch of luxury that elevates your overall aesthetic. Great color harmony.',
        detectedItems: ['accessories', 'scarf']
      },
      {
        id: '3',
        name: 'Designer Ankle Boots',
        price: 245,
        image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Footwear',
        match: 87,
        styleAnalysis: 'These boots complete the look with modern edge while maintaining elegance.',
        detectedItems: ['shoes', 'boots']
      }
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <main className="relative">
        {!currentMode && <Hero onModeSelect={handleModeChange} />}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-8"
        >
          {currentMode === 'image' && (
            <UploadInterface 
              onImageUpload={setUploadedImage}
              onSearch={() => simulateAISearch('image')}
              isSearching={isSearching}
              onBack={() => handleModeChange(null)}
            />
          )}
          
          {currentMode === 'voice' && (
            <VoiceInterface 
              onSearch={() => simulateAISearch('voice')}
              isSearching={isSearching}
              onBack={() => handleModeChange(null)}
            />
          )}
          
          {searchResults.length > 0 && (
            <ResultsDisplay 
              results={searchResults}
              uploadedImage={uploadedImage}
              searchMode={currentMode}
            />
          )}
          
          {!currentMode && <ProductCatalog />}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
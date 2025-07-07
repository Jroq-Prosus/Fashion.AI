
import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Fashionista AI
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Home</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Explore</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">My Style</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Help</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-purple-50 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600 hover:text-purple-600" />
          </button>
          <button className="p-2 hover:bg-purple-50 rounded-full transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-purple-600" />
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">3</span>
          </button>
          <button className="p-2 hover:bg-purple-50 rounded-full transition-colors">
            <User className="w-5 h-5 text-gray-600 hover:text-purple-600" />
          </button>
          <button className="md:hidden p-2 hover:bg-purple-50 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-gray-600 hover:text-purple-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

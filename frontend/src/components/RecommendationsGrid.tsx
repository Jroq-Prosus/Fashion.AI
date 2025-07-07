
import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface RecommendationsGridProps {
  searchQuery: string;
}

const RecommendationsGrid = ({ searchQuery }: RecommendationsGridProps) => {
  const products = [
    {
      id: 1,
      name: 'Urban Winter Jacket',
      price: 129.99,
      originalPrice: 199.99,
      rating: 4.8,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      style: 'Urban',
      materials: 'Cotton blend, Water-resistant',
      matchScore: 95,
    },
    {
      id: 2,
      name: 'Minimalist Wool Coat',
      price: 249.99,
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop',
      style: 'Minimal',
      materials: 'Pure wool, Silk lining',
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Streetwear Bomber',
      price: 89.99,
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      style: 'Streetwear',
      materials: 'Polyester, Fleece lining',
      matchScore: 92,
    },
    {
      id: 4,
      name: 'Classic Trench Coat',
      price: 189.99,
      rating: 4.7,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop',
      style: 'Classic',
      materials: 'Cotton gabardine',
      matchScore: 85,
    },
    {
      id: 5,
      name: 'Sporty Windbreaker',
      price: 69.99,
      rating: 4.5,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      style: 'Sporty',
      materials: 'Nylon, Mesh lining',
      matchScore: 78,
    },
    {
      id: 6,
      name: 'Vintage Leather Jacket',
      price: 299.99,
      rating: 4.9,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop',
      style: 'Vintage',
      materials: 'Genuine leather',
      matchScore: 90,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
        <div className="text-sm text-gray-500">
          Based on: "{searchQuery || 'your search'}"
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                {product.matchScore}% match
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {product.style}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{product.materials}</p>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-800">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                    More Like This
                  </button>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsGrid;

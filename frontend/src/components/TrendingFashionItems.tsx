import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

const TrendingFashionItems = () => {
  const trendingItems = [
    {
      id: 1,
      name: 'Oversized Blazer',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.8,
      reviews: 324,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
      category: 'Trending',
      isNew: true,
    },
    {
      id: 2,
      name: 'Silk Midi Dress',
      price: 89.99,
      rating: 4.9,
      reviews: 256,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      category: 'New Arrival',
      isNew: true,
    },
    {
      id: 3,
      name: 'Vintage Denim Jacket',
      price: 79.99,
      rating: 4.7,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      category: 'Popular',
      isNew: false,
    },
    {
      id: 4,
      name: 'Cashmere Sweater',
      price: 199.99,
      rating: 4.9,
      reviews: 145,
      image: '/lovable-uploads/b9bb10d5-4c78-48f1-8841-f5da994bd875.png',
      category: 'Luxury',
      isNew: false,
    },
    {
      id: 5,
      name: 'Statement Earrings',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop',
      category: 'Accessories',
      isNew: false,
    },
    {
      id: 6,
      name: 'Leather Ankle Boots',
      price: 129.99,
      rating: 4.8,
      reviews: 167,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
      category: 'Footwear',
      isNew: true,
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Trending Fashion Items
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what's popular right now and stay ahead of the fashion curve
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:border-purple-200">
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-purple-500" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.category === 'Trending' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' :
                    item.category === 'New Arrival' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    item.category === 'Popular' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                    item.category === 'Luxury' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {item.category}
                  </span>
                  {item.isNew && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{item.name}</h3>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {item.rating} ({item.reviews})
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-800">
                      ${item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
            View All Trending Items
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingFashionItems;

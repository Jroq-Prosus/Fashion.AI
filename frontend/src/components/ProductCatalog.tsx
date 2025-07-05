import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Filter, Grid, List } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const trendingProducts = [
    {
      id: '1',
      name: 'Sustainable Cotton Tee',
      price: 45,
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Basics',
      trend: 'Eco-Fashion'
    },
    {
      id: '2',
      name: 'Vintage Denim Jacket',
      price: 89,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Outerwear',
      trend: 'Y2K Revival'
    },
    {
      id: '3',
      name: 'Minimalist Leather Bag',
      price: 156,
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Accessories',
      trend: 'Quiet Luxury'
    },
    {
      id: '4',
      name: 'Silk Midi Dress',
      price: 210,
      image: 'https://images.pexels.com/photos/2834009/pexels-photo-2834009.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Dresses',
      trend: 'Romantic Core'
    }
  ];

  const categories = [
    'All', 'New Arrivals', 'Trending', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes'
  ];

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Now
            </h2>
            <p className="text-gray-600">
              Discover the latest fashion trends curated by AI
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <div className="flex border border-gray-200 rounded-lg">
              <button className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-200">
                <Grid className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-50 transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                index === 0 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Trend Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{product.trend}</span>
              </div>
              
              {/* Category */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-white/90 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                  {product.category}
                </span>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                {product.name}
              </h3>
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <button className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
          Load More Products
        </button>
      </motion.div>
    </section>
  );
};

export default ProductCatalog;
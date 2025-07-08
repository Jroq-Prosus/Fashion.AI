import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { fetcher } from '../lib/fetcher';

const PAGE_SIZE = 6;
const PLACEHOLDER_IMAGE = '/placeholder.png'; // You can provide a real placeholder image in public/

const getCategoryStyle = (category: string | null | undefined) => {
  switch (category) {
    case 'Trending':
      return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white';
    case 'New Arrival':
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    case 'Popular':
      return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
    case 'Luxury':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const fetchTrendingItems = async (page: number) => {
  const API_URL = `/products/all?page=${page}`;
  const data = await fetcher(API_URL);
  return data.data;
};

const TrendingFashionItems = () => {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trending-fashion-items', page],
    queryFn: () => fetchTrendingItems(page),
  });

  React.useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllItems(data || []);
      } else if (Array.isArray(data) && data.length > 0) {
        setAllItems((prev) => [...prev, ...data]);
      }
      setIsFetchingMore(false);
    }
  }, [data, page]);

  const handleViewMore = () => {
    setIsFetchingMore(true);
    setPage((prev) => prev + 1);
  };

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
        {isLoading && page === 1 && (
          <div className="text-center text-lg text-gray-500 py-12">Loading trending items...</div>
        )}
        {isError && (
          <div className="text-center text-lg text-red-500 py-12">Failed to load trending items.</div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allItems.map((item: any) => {
            const {
              id,
              name,
              material_info,
              description,
              brand,
              gender,
              category,
              product_link,
              image,
              reviews,
            } = item;
            let rating = 0;
            let reviewCount = 0;
            if (Array.isArray(reviews) && reviews.length > 0) {
              rating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
              reviewCount = reviews.length;
            }
            const displayImage = image || PLACEHOLDER_IMAGE;
            const displayCategory = category || 'Uncategorized';
            const displayName = name || 'Unnamed Product';
            const displayDescription = description || '';
            const displayBrand = brand || '';
            const displayMaterial = material_info || '';
            const isNew = false;
            return (
              <div key={id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:border-purple-200">
                <div className="relative overflow-hidden">
                  <img 
                    src={displayImage} 
                    alt={displayName}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-purple-500" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(displayCategory)}`}>
                      {displayCategory}
                    </span>
                    {isNew && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">{displayName}</h3>
                  <div className="text-sm text-gray-500 mb-2">{displayBrand}</div>
                  <div className="text-sm text-gray-500 mb-2">{displayMaterial}</div>
                  <div className="text-sm text-gray-500 mb-2">{displayDescription}</div>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.round(rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {rating ? rating.toFixed(1) : 'N/A'} ({reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* No price/originalPrice in backend, so skip or add logic if available */}
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <button
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            onClick={handleViewMore}
            disabled={isFetchingMore || (data && data.length < PAGE_SIZE)}
          >
            {isFetchingMore ? 'Loading...' : 'View More Trending Items'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingFashionItems;

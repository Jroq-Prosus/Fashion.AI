
import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';

const NearbyStores = () => {
  const stores = [
    {
      id: 1,
      name: 'Urban Fashion Hub',
      distance: '0.3 miles',
      availability: 'In Stock',
      address: '123 Fashion St',
      hours: 'Open until 9 PM',
    },
    {
      id: 2,
      name: 'Style Central',
      distance: '0.8 miles',
      availability: 'Limited Stock',
      address: '456 Trend Ave',
      hours: 'Open until 8 PM',
    },
    {
      id: 3,
      name: 'Premium Boutique',
      distance: '1.2 miles',
      availability: 'In Stock',
      address: '789 Luxury Blvd',
      hours: 'Open until 10 PM',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Stores</h3>
      
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-4">
        <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Interactive map view</p>
          </div>
        </div>
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
          View Full Map
        </button>
      </div>
      
      <div className="space-y-3">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-800">{store.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                store.availability === 'In Stock' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {store.availability}
              </span>
            </div>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{store.address} • {store.distance}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>{store.hours}</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyStores;

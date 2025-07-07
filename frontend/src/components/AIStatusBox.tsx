
import React, { useState, useEffect } from 'react';
import { Brain, Globe, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';

const AIStatusBox = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Loader2, text: "Analyzing query...", color: "text-blue-600" },
    { icon: Brain, text: "Activating reasoning model", color: "text-purple-600" },
    { icon: Globe, text: "Searching trends online...", color: "text-green-600" },
    { icon: MapPin, text: "Looking for nearby stores...", color: "text-orange-600" },
    { icon: ImageIcon, text: "Matching similar items...", color: "text-pink-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Processing</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className={`flex items-center space-x-3 ${
                isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-30'
              }`}>
                <div className={`p-2 rounded-full ${
                  isActive ? 'bg-gradient-to-r from-purple-100 to-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive ? step.color : 'text-gray-400'
                  } ${isActive && Icon === Loader2 ? 'animate-spin' : ''}`} />
                </div>
                <span className={`text-sm ${
                  isActive ? 'text-gray-800 font-medium' : 'text-gray-500'
                }`}>
                  {step.text}
                </span>
                {isCompleted && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIStatusBox;

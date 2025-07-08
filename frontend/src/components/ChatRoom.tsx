import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, Mic, Loader2 } from 'lucide-react';
import {
  detectObjects,
  imageRetrieval,
  onlineSearchAgent,
  generateFashionAdvisorResponse,
  fashionAdvisorVisual,
  fetchTrendGeoStores,
} from '../lib/fetcher';
import { ChatMessage, RetrievalResult } from '@/models/chat';
import { ProductPreview } from '@/models/product';
import { useNavigate } from 'react-router-dom';
import { type TrendGeoRes } from '@/models/chat';

interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, image?: string, voice?: boolean) => void;
}

const ChatRoom = ({ isOpen, onClose, onSearch }: ChatRoomProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI fashion assistant. Upload an image, describe what you're looking for, or use voice to find the perfect style matches!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [lastProductForNearby, setLastProductForNearby] = useState<any>(null);
  const [lastUserQuery, setLastUserQuery] = useState<string>('');
  const [showNearbyButton, setShowNearbyButton] = useState(false);
  const [nearbySearchLoading, setNearbySearchLoading] = useState(false);
  const [nearbyButtonMessageId, setNearbyButtonMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, isTyping = false, options?: any) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      isUser,
      timestamp: new Date(),
      isTyping,
      ...options,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (messageId: string, text: string, options?: any) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text, isTyping: false, ...options } : msg
    ));
  };

  const handleAIWorkflow = async (query: string, image?: string, voice?: boolean) => {
    setIsProcessing(true);
    const typingMessageId = addMessage('', false, true);
    let aiResponse = '';
    let productPreview: ProductPreview | undefined = undefined;
    let firstProduct: any = null;
    try {
      if (image) {
        // 1. Detect objects
        const detectionResult = await detectObjects(image);
        if (!detectionResult || !detectionResult.bboxes || !detectionResult.labels) {
          throw new Error('Object detection failed.');
        }
        const items = {
          bboxes: detectionResult.bboxes,
          labels: detectionResult.labels,
          scores: detectionResult.scores || [],
        };
        // 2. Image retrieval
        const retrievalResult: RetrievalResult = await imageRetrieval({
          image_base64: image,
          items,
        });

        // 3. Generate fashion advisor response
        if (
          retrievalResult.products &&
          retrievalResult.products.length > 0 &&
          retrievalResult.retrieved_image_paths &&
          retrievalResult.retrieved_image_paths.length > 0
        ) {
          firstProduct = retrievalResult.products[0];
          const firstImage = retrievalResult.retrieved_image_paths[0];
          productPreview = {
            id: firstProduct.id,
            image: firstImage,
            name: firstProduct.name,
            description: firstProduct.description,
          };
          setLastProductForNearby(firstProduct);
          setLastUserQuery(query || '');
          setTimeout(() => {
            setShowNearbyButton(true);
          }, 500);
        }
        const advisorResponse = await generateFashionAdvisorResponse(
          image,
          retrievalResult,
          query || ''
        );
        console.log('advisorResponse', advisorResponse);
        aiResponse = advisorResponse && advisorResponse.response
          ? advisorResponse.response
          : 'AI response generated.';
        updateMessage(typingMessageId, aiResponse, { productPreview });
        if (productPreview) {
          setLastProductForNearby(firstProduct);
          setLastUserQuery(query || '');
          setTimeout(() => {
            setShowNearbyButton(true);
          }, 500);
        }

        // --- Add: Make another API call after advisorResponse ---
        /** Comment out for now as this is kinda duplicate of generateFashionAdvisorResponse
        * try {
        *   const followupData = await fashionAdvisorVisual(image, query || '');
        *   let followupMsg = '';
        *   if (followupData?.response && typeof followupData.response === 'string' && followupData.response.trim()) {
        *     followupMsg = followupData.response;
        *   } else if (typeof followupData === 'object' && Object.keys(followupData).length > 0) {
        *     followupMsg = 'AI (follow-up) response:\n' + JSON.stringify(followupData, null, 2);
        *   } else {
        *     followupMsg = 'AI (follow-up) did not return a readable response.';
        *   }
        *   addMessage(followupMsg, false);
        * } catch (followupErr: any) {
        *   addMessage('Follow-up AI response failed. Please try again later.', false);
        * }
        // --- End add ---
        */
      } else if (query) {
        // Text only: online search agent
        const result = await onlineSearchAgent(query);
        aiResponse = result && result.message ? result.message : 'Search completed.';
        updateMessage(typingMessageId, aiResponse, { productPreview });
      }
    } catch (error: any) {
      aiResponse = error.message || 'An error occurred.';
      updateMessage(typingMessageId, aiResponse, { productPreview });
    }
    setIsProcessing(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    if (inputValue.trim()) {
      addMessage(inputValue, true);
    }
    if (selectedImage) {
      addMessage('📷 Uploaded fashion image', true);
    }
    const query = inputValue;
    setInputValue('');
    await handleAIWorkflow(query, selectedImage || undefined);
    setSelectedImage(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    addMessage('🎙️ Voice message recorded', true);
    // Simulate voice processing
    setTimeout(async () => {
      setIsListening(false);
      const voiceQuery = 'stylish winter jacket for women';
      await handleAIWorkflow(voiceQuery, undefined, true);
    }, 2000);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleAddToCart = (product: ProductPreview) => {
    // TODO: Implement add to cart logic
    alert(`Added ${product.name} to cart!`);
  };

  const handleSearchFashionNearby = async (product: any, userQuery: string, messageId: string) => {
    setNearbySearchLoading(true);
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isThinking: true } : msg
    ));
    const stopThinking = () => setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isThinking: false } : msg
    ));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const user_location = `${position.coords.latitude},${position.coords.longitude}`;
        try {
          const trendGeoRes: TrendGeoRes = await fetchTrendGeoStores(product, userQuery, user_location);
          console.log('trendGeoRes', trendGeoRes);
          if (trendGeoRes && Array.isArray(trendGeoRes.stores) && trendGeoRes.stores.length > 0) {
            addMessage('', false, false, {
              type: 'store-maps',
              stores: trendGeoRes.stores
            });
          } else {
            addMessage('No nearby store recommendations found.', false);
          }
          stopThinking();
        } catch (err) {
          addMessage('Failed to fetch nearby store recommendations.', false);
          stopThinking();
        }
        setNearbySearchLoading(false);
        setShowNearbyButton(false);
      }, () => {
        addMessage('Location access denied. Cannot fetch nearby store recommendations.', false);
        stopThinking();
        setNearbySearchLoading(false);
        setShowNearbyButton(false);
      });
    } else {
      addMessage('Geolocation is not supported by your browser.', false);
      stopThinking();
      setNearbySearchLoading(false);
      setShowNearbyButton(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Fashionista AI Assistant</h2>
            <p className="text-sm text-gray-600">Your personal style advisor</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.isTyping ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line">{message.text}</p>
                    {message.productPreview && (
                      <div className="mt-4 flex items-center space-x-4 bg-white rounded-xl shadow p-3 border border-gray-200">
                        <img
                          src={message.productPreview.image}
                          alt={message.productPreview.name}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <div>
                          <div className="font-semibold text-base text-gray-800">{message.productPreview.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{message.productPreview.description}</div>
                          <div className="flex space-x-2 mt-2">
                            {message.productPreview.id && (
                              <button
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all duration-200"
                                onClick={() => navigate(`/product/${message.productPreview.id}`)}
                              >
                                Visit
                              </button>
                            )}
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg"
                              onClick={() => handleAddToCart(message.productPreview)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" /><circle cx="7" cy="21" r="1" /><circle cx="20" cy="21" r="1" /></svg>
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {message.isThinking && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    )}
                    {message.type === 'store-maps' && message.stores && (
                      <div className="space-y-4 mt-2">
                        {message.stores.map((store, idx) => (
                          <div key={idx} className="mb-4">
                            <div className="font-semibold">{store.name}</div>
                            <div className="text-sm text-gray-600 mb-2">{store.address}</div>
                            <iframe
                              width="250"
                              height="150"
                              style={{ border: 0, borderRadius: '8px' }}
                              loading="lazy"
                              allowFullScreen
                              src={`https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {showNearbyButton && lastProductForNearby && lastUserQuery && (
            <div className="flex justify-end">
              <div className="max-w-[70%] p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white mt-4">
                {!nearbySearchLoading ? (
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      // Add a user message for the button, then call the handler
                      const msgId = crypto.randomUUID();
                      setNearbyButtonMessageId(msgId);
                      setMessages(prev => [...prev, {
                        id: msgId,
                        text: 'Search for fashion nearby',
                        isUser: true,
                        timestamp: new Date(),
                        isThinking: false,
                      }]);
                      setShowNearbyButton(false);
                      handleSearchFashionNearby(lastProductForNearby, lastUserQuery, msgId);
                    }}
                  >
                    Search for fashion nearby
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
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
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-100 animate-pulse' 
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              title="Voice input"
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-600' : 'text-blue-600'}`} />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Describe what you're looking for..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {selectedImage && (
                <div className="absolute left-0 top-full mt-2 flex items-center space-x-2 bg-gray-100 p-2 rounded-xl shadow-md">
                  <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  <button onClick={removeSelectedImage} className="text-red-500 hover:underline text-xs">Remove</button>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSend}
              disabled={(!inputValue.trim() && !selectedImage) || isProcessing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

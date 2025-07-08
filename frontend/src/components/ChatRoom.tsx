import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, Mic, Loader2 } from 'lucide-react';
import {
  detectObjects,
  imageRetrieval,
  onlineSearchAgent,
  generateFashionAdvisorResponse,
  fashionAdvisorVisual,
  fetchTrendGeoStores,
  voiceToText,
  fashionAdvisorTextOnly,
} from '../lib/fetcher';
import { ChatMessageWithImage, VoiceToTextResponse } from '@/models/chat';
import { ProductPreview } from '@/models/product';
import { useNavigate } from 'react-router-dom';
import { type TrendGeoRes } from '@/models/chat';
import { useAuth } from '@/hooks/use-auth';

// Helper to decode JWT and get sub (user_id)
function getUserIdFromToken(token?: string | null): string | undefined {
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return undefined;
  }
}

interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, image?: string, voice?: boolean) => void;
}

const ChatRoom = ({ isOpen, onClose, onSearch }: ChatRoomProps) => {
  const [messages, setMessages] = useState<ChatMessageWithImage[]>([
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [lastProductForNearby, setLastProductForNearby] = useState<any>(null);
  const [lastUserQuery, setLastUserQuery] = useState<string>('');
  const [showNearbyButton, setShowNearbyButton] = useState(false);
  const [nearbySearchLoading, setNearbySearchLoading] = useState(false);
  const [nearbyButtonMessageId, setNearbyButtonMessageId] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { user, token } = useAuth();
  const user_id = getUserIdFromToken(token);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!mediaRecorder) return;
  }, [mediaRecorder]);

  useEffect(() => {
    if (recordedAudio) {
      handleProcessAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordedAudio]);

  const addMessage = (text: string, isUser: boolean, isTyping = false, options?: any) => {
    const newMessage: ChatMessageWithImage = {
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

  // Modular handler for all input combinations
  const processUserInput = async ({ text, image, source }: { text?: string; image?: string; source: 'text' | 'voice' }) => {
    setIsProcessing(true);
    const typingMessageId = addMessage('', false, true);
    let aiResponse = '';
    let productPreviews: ProductPreview[] | undefined = undefined;
    try {
      if (image) {
        // 2. Generate fashion advisor response (with image)
        const advisorResponse = await fashionAdvisorVisual(
          image,
          text || ''
        );
        console.log('advisorResponse', advisorResponse);
        aiResponse = advisorResponse && advisorResponse.response
          ? advisorResponse.response
          : 'AI response generated.';
        productPreviews = advisorResponse && advisorResponse.products && advisorResponse.products.length > 0 ? advisorResponse.products.map((prod: any) => ({
          id: prod.id,
          image: prod.image,
          name: prod.name,
          description: prod.description,
        })) : undefined;
        updateMessage(typingMessageId, aiResponse, { productPreviews });
        if (productPreviews && productPreviews.length > 0) {
          setLastProductForNearby(productPreviews[0]);
          setLastUserQuery(text || '');
          setTimeout(() => {
            setShowNearbyButton(true);
          }, 500);
        }
      } else if (text) {
        // Only text or voice: use fashionAdvisorTextOnly
        const advisorResponse = await fashionAdvisorTextOnly(text);
        aiResponse = advisorResponse && advisorResponse.response
          ? advisorResponse.response
          : 'AI response generated.';
        productPreviews = advisorResponse && advisorResponse.products && advisorResponse.products.length > 0 ? advisorResponse.products.map((prod: any) => ({
          id: prod.id,
          image: prod.image,
          name: prod.name,
          description: prod.description,
        })) : undefined;
        updateMessage(typingMessageId, aiResponse, { productPreviews });
        // Optionally, you can use advisorResponse.products for future product display
      }
    } catch (error: any) {
      aiResponse = error.message || 'An error occurred.';
      updateMessage(typingMessageId, aiResponse, { productPreviews });
    }
    setIsProcessing(false);
  };

  // Refactored handleSend to use processUserInput
  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    if (inputValue.trim() || selectedImage) {
      addMessage(inputValue, true, false, selectedImage ? { image: selectedImage } : undefined);
    }
    const text = inputValue;
    setInputValue('');
    setPreviewImage(null);
    await processUserInput({ text, image: selectedImage || undefined, source: 'text' });
    setSelectedImage(null);
  };

  // Refactored handleProcessAudio to only transcribe and set inputValue
  const handleProcessAudio = async () => {
    if (!recordedAudio) return;
    setIsTranscribing(true);
    try {
      const file = new File([recordedAudio], 'voice.webm', { type: 'audio/webm' });
      const res: VoiceToTextResponse = await voiceToText(file);
      const text = typeof res.data.transcript.text === 'string' ? res.data.transcript.text : (typeof res.message === 'string' ? res.message : '');
      if (text) {
        setInputValue(text); // Show transcript in input for editing
      } else {
        addMessage('Could not transcribe audio.', false);
      }
    } catch (err: any) {
      addMessage('Voice-to-text failed. Please try again.', false);
    }
    setRecordedAudio(null);
    setIsTranscribing(false);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
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
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded preview"
                        className="w-32 h-32 object-cover rounded-lg mb-2 border"
                      />
                    )}
                    <p className="whitespace-pre-line">{message.text}</p>
                    {message.productPreviews && message.productPreviews.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {message.productPreviews.map((preview, idx) => (
                          <div key={idx} className="flex items-center space-x-4 bg-white rounded-xl shadow p-3 border border-gray-200">
                            <img
                              src={preview.image}
                              alt={preview.name}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <div>
                              <div className="font-semibold text-base text-gray-800">{preview.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{preview.description}</div>
                              <div className="flex space-x-2 mt-2">
                                {preview.id && (
                                  <button
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all duration-200"
                                    onClick={() => navigate(`/product/${preview.id}`)}
                                  >
                                    Visit
                                  </button>
                                )}
                                <button
                                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg"
                                  onClick={() => handleAddToCart(preview)}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" /><circle cx="7" cy="21" r="1" /><circle cx="20" cy="21" r="1" /></svg>
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    setSelectedImage(imageUrl);
                    setPreviewImage(imageUrl);
                  };
                  reader.readAsDataURL(file);
                }
              }}
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
              onClick={() => {
                if (isListening) {
                  mediaRecorder?.stop();
                  setIsListening(false);
                  // When recording stops, transcribe
                  handleProcessAudio();
                } else {
                  if (!navigator.mediaDevices || !window.MediaRecorder) {
                    alert('Audio recording is not supported in this browser.');
                  } else {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                      .then(stream => {
                        const recorder = new MediaRecorder(stream);
                        let localAudioChunks: Blob[] = [];
                        recorder.ondataavailable = (e) => {
                          if (e.data.size > 0) {
                            localAudioChunks.push(e.data);
                          }
                        };
                        recorder.onstop = () => {
                          const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm' });
                          setRecordedAudio(audioBlob);
                          stream.getTracks().forEach((track) => track.stop());
                        };
                        recorder.start();
                        setMediaRecorder(recorder);
                        setIsListening(true);
                      })
                      .catch(err => {
                        console.error('Error accessing microphone:', err);
                        alert('Could not access microphone. Please check browser permissions.');
                      });
                  }
                }
              }}
              className={`p-3 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-100 animate-pulse' 
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              title={isListening ? 'Stop recording' : 'Voice input'}
              disabled={isProcessing}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-600' : 'text-blue-600'}`} />
            </button>
            {isTranscribing && recordedAudio && (
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-xl shadow-md">
                <audio controls src={URL.createObjectURL(recordedAudio)} />
                <span className="text-sm text-gray-600">Transcribing...</span>
              </div>
            )}
            
            <div className="flex-1 relative">
              {isListening ? (
                <div className="w-full px-4 py-3 rounded-xl border border-blue-400 bg-blue-50 text-blue-700 flex items-center justify-center font-semibold animate-pulse">
                  <Mic className="w-5 h-5 mr-2 text-blue-600" /> Listening...
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Describe what you're looking for..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {previewImage && (
                    <div className="absolute left-0 top-full mt-2 flex items-center space-x-2 bg-gray-100 p-2 rounded-xl shadow-md">
                      <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      <button onClick={() => { removeSelectedImage(); }} className="text-red-500 hover:underline text-xs">Remove</button>
                    </div>
                  )}
                </>
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

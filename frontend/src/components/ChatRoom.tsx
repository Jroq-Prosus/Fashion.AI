
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, Mic, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, isTyping = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isTyping,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (messageId: string, text: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text, isTyping: false } : msg
    ));
  };

  const simulateAIResponse = async (query: string) => {
    setIsProcessing(true);
    const typingMessageId = addMessage('', false, true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const responses = [
      `I've analyzed your request for "${query}" and found 4 stylish matches! Here are my top recommendations:\n\n1. Urban Minimalist Jacket - $89\n2. Classic Denim Blazer - $65\n3. Oversized Wool Coat - $120\n4. Vintage Leather Jacket - $95\n\nWould you like me to show details for any of these?`,
      `Great choice! I found several "${query}" options that match current trends:\n\n1. Sustainable Cotton Blend - $45\n2. Premium Organic Material - $78\n3. Designer Collection Piece - $156\n4. Eco-Friendly Alternative - $52\n\nEach item comes with detailed material info and styling tips!`,
      `Perfect! Based on your "${query}" search, I've curated these matches:\n\n1. Trending Style #1 - $67\n2. Classic Comfort Fit - $43\n3. Statement Piece - $89\n4. Versatile Daily Wear - $54\n\nI can also check nearby store availability if you'd like!`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    updateMessage(typingMessageId, response);
    setIsProcessing(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue, true);
    const query = inputValue;
    setInputValue('');
    
    onSearch(query);
    await simulateAIResponse(query);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        addMessage('📷 Uploaded fashion image', true);
        onSearch('', imageUrl);
        await simulateAIResponse('uploaded image analysis');
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
      onSearch(voiceQuery, undefined, true);
      await simulateAIResponse(voiceQuery);
    }, 2000);
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
                  <p className="whitespace-pre-line">{message.text}</p>
                )}
                <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
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
            </div>
            
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
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

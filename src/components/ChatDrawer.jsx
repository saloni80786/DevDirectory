import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageSquare, X } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function ChatDrawer({ currentUserId, selectedDevId, selectedDevName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (currentUserId) {
      socket.emit('user_connected', currentUserId);
    }

    socket.on('receive_message', (newMsg) => {
      if (newMsg.senderId === selectedDevId || newMsg.receiverId === selectedDevId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => socket.off('receive_message');
  }, [currentUserId, selectedDevId]);

  const handleSendMessage = () => {
    if (!inputMsg.trim() || !selectedDevId) return;

    const msgData = {
      senderId: currentUserId,
      receiverId: selectedDevId,
      message: inputMsg
    };

    socket.emit('send_message', msgData);
    setMessages((prev) => [...prev, { ...msgData, timestamp: new Date() }]);
    setInputMsg('');
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#b35900] text-white p-4 rounded-full shadow-lg hover:bg-[#804000] transition-all z-50"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#fbf8f3] border-l border-[#e6decb] shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 bg-[#f2eada] border-b border-[#e6decb] flex justify-between items-center">
            <h3 className="font-bold text-[#2b261f]">Chat with {selectedDevName || 'Developer'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#8c8273] hover:text-[#2b261f]">
              <X size={20} />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-[#b35900] text-white'
                      : 'bg-[#efe6d5] text-[#2b261f]'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-[#e6decb] flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 bg-[#f2eada] border border-[#d8cdb8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#b35900]"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#b35900] text-white p-2 rounded-md hover:bg-[#804000]"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
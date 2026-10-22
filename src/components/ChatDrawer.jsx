
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageSquare, X } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const socket = BACKEND_URL ? io(BACKEND_URL) : null;

export default function ChatDrawer({
  currentUserId,
  selectedDevId,
  selectedDevName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !currentUserId || !selectedDevId) return;

    const handleReceiveMessage = (newMsg) => {
      const belongsToChat =
        (newMsg.senderId === currentUserId &&
          newMsg.receiverId === selectedDevId) ||
        (newMsg.senderId === selectedDevId &&
          newMsg.receiverId === currentUserId);

      if (belongsToChat) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.emit('user_connected', currentUserId);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [currentUserId, selectedDevId]);

  const handleSendMessage = () => {
    const message = inputMsg.trim();

    if (!message || !selectedDevId || !currentUserId) return;

    const msgData = {
      senderId: currentUserId,
      receiverId: selectedDevId,
      message,
    };

    if (!socket) {
      setMessages((prev) => [
        ...prev,
        {
          senderId: 'system',
          message:
            'Chat unavailable. Please configure the chat backend.',
          timestamp: new Date(),
        },
      ]);
      setInputMsg('');
      return;
    }

    socket.emit('send_message', msgData);

    setMessages((prev) => [
      ...prev,
      { ...msgData, timestamp: new Date() },
    ]);

    setInputMsg('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 rounded-full bg-rose-600 p-4 text-white shadow-lg transition hover:bg-rose-700"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-rose-100 bg-rose-50 shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-rose-100 bg-rose-100 p-4">
            <h3 className="font-bold text-gray-900">
              Chat with {selectedDevName || 'Developer'}
            </h3>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-gray-600 transition hover:text-rose-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.senderId === currentUserId
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-xl p-3 text-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-rose-100 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(event) => setInputMsg(event.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
              className="min-w-0 flex-1 rounded-lg border border-rose-200 px-3 py-2 outline-none focus:border-rose-500"
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={!inputMsg.trim()}
              className="rounded-lg bg-rose-600 px-4 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

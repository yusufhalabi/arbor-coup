'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Message } from '@/types';
import { createClient } from "@/utils/supabase/server";
import { useUser } from '@/context/UserContext';

export default function ChatPage() {
  const { displayName, isLoading, error } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const initSocket = async () => {
      const io = (await import('socket.io-client')).io;
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);
    };
    
    initSocket();

    // Cleanup on unmount
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for previous messages
    socket.on('previous-messages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('previous-messages');
      socket.off('new-message');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: displayName || 'Anonymous',
      timestamp: Date.now(),
    };

    socket.emit('send-message', message);
    setNewMessage('');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      Loading...
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">
      Error: {error}
    </div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className="p-3 rounded-lg bg-white shadow"
          >
            <div className="font-bold">{message.sender}</div>
            <div>{message.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
} 
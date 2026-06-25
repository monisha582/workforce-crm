import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { showToast, showErrorToast } from '../../utils/toast';

export default function ChatPage() {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/channels');
      setChannels(res.data.data || []);
      if (res.data.data && res.data.data.length && !activeChannel) setActiveChannel(res.data.data[0]);
    } catch (e) {
      console.error('Failed to load channels', e);
      showErrorToast(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const res = await api.get(`/chat/channels/${channelId}/announcements`);
      setMessages(res.data.data || []);
    } catch (e) {
      console.error('Failed to load messages', e);
      showErrorToast(e);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) fetchMessages(activeChannel.id);
  }, [activeChannel]);

  const handleSend = async () => {
    if (!text.trim()) {
      showToast.info('Please enter a message');
      return;
    }

    if (!activeChannel) {
      showToast.info('Please select a channel first');
      return;
    }

    setSending(true);
    try {
      await api.post(`/chat/channels/${activeChannel.id}/announcements`, { content: text });
      setText('');
      await fetchMessages(activeChannel.id);
      showToast.success('Message sent');
    } catch (e) {
      console.error(e);
      showErrorToast(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold">Chat & Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-1">
        {/* Channels List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Channels</h2>
          <nav className="space-y-2" aria-label="Chat channels">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full text-left p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeChannel?.id === channel.id ? 'bg-blue-100 font-semibold' : ''
                }`}
                aria-current={activeChannel?.id === channel.id ? 'page' : undefined}
                aria-label={`Select channel: ${channel.name}`}
              >
                {channel.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="font-semibold mb-4">{activeChannel?.name || 'Select a channel'}</h2>
          <div 
            ref={listRef} 
            className="flex-1 overflow-y-auto space-y-3 mb-4"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length > 0 ? (
              messages.map((msg) => (
                <article key={msg.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-semibold text-sm" role="note">
                    {msg.authorName || 'System'}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </article>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Message input"
            />
            <button 
              onClick={handleSend} 
              disabled={sending}
              aria-busy={sending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

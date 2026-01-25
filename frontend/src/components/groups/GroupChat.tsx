import { useState, useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import { Send, Paperclip, X, Download, Trash2 } from 'lucide-react';

interface Message {
  id: number;
  group_id: number;
  user_id: number;
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
}

const GroupChat = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/chat/group/${groupId}/messages`);
      const data = await res.json();
      
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setAttachment(file);
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    // For now, we'll use a simple base64 encoding
    // In production, you'd upload to a proper file storage service
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && !attachment) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    setIsSending(true);

    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      if (attachment) {
        attachmentUrl = await uploadAttachment(attachment);
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }

      const res = await fetch('http://127.0.0.1:5000/api/chat/group/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          group_id: parseInt(groupId || '0'),
          message: newMessage.trim() || '(Attachment)',
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setAttachment(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/chat/group/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (res.ok) {
        toast.success('Message deleted');
        fetchMessages();
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('An error occurred');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.attachment_url) return null;

    const isImage = msg.attachment_type?.startsWith('image/');
    
    return (
      <div className="mt-2">
        {isImage ? (
          <img 
            src={msg.attachment_url} 
            alt={msg.attachment_name || 'Attachment'}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(msg.attachment_url || '', '_blank')}
          />
        ) : (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg max-w-xs">
            <Paperclip size={16} />
            <span className="text-sm truncate flex-1">{msg.attachment_name}</span>
            <a 
              href={msg.attachment_url} 
              download={msg.attachment_name || 'download'}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download size={16} />
            </a>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-bold">Group Chat</h2>
        <p className="text-sm text-gray-500">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_email === user.email;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-600 mb-1 px-1 font-medium">
                      {msg.user_name || msg.user_email}
                    </p>
                  )}
                  
                  <div className="relative group">
                    <div 
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      {renderAttachment(msg)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <p className="text-xs text-gray-500">{formatTime(msg.created_at)}</p>
                      
                      {isOwnMessage && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="px-6 py-4 border-t">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <Paperclip size={16} />
            <span className="text-sm flex-1 truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            disabled={isSending}
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isSending}
          />
          
          <button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !attachment)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send size={20} />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;

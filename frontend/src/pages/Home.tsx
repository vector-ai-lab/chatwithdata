import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiEdit2, FiTrash2, FiArchive, FiChevronDown } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

const Home: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { logout } = useAuth();
  const settingsRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => chatAPI.getHistory().then(res => res.data),
  });

  const { data: currentChat } = useQuery({
    queryKey: ['chat', selectedChat],
    queryFn: () => selectedChat ? chatAPI.getChat(selectedChat).then(res => res.data) : null,
    enabled: !!selectedChat,
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (!isNewChat) {
      toast.error('File upload is only allowed at the start of a new chat');
      return;
    }
    const file = acceptedFiles[0];
    const allowedTypes = ['.txt', '.pptx', '.docx', '.md', '.pdf'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload .txt, .pptx, .docx, .md, or .pdf files.');
      return;
    }
    try {
      await chatAPI.uploadFile(file);
      setIsNewChat(false);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleDeleteAllChats = async () => {
    if (window.confirm('Are you sure you want to delete all chats?')) {
      try {
        await chatAPI.deleteAllChats();
        refetchHistory();
        toast.success('All chats deleted successfully');
      } catch (error) {
        toast.error('Failed to delete chats');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await chatAPI.deleteAccount();
        logout();
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  const handleArchiveChats = async () => {
    try {
      await chatAPI.archiveChats();
      refetchHistory();
      toast.success('All chats archived successfully');
    } catch (error) {
      toast.error('Failed to archive chats');
    }
  };

  // Close settings dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#18181b]">
      {/* Sidebar */}
      <div className="w-72 bg-black flex flex-col text-white py-6 px-4 relative">
        <h2 className="text-2xl font-bold mb-8 tracking-tight">Chat History</h2>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {chatHistory?.length ? chatHistory.map((chat: Chat) => (
            <div
              key={chat.id}
              className={`group p-3 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 ${selectedChat === chat.id ? 'bg-green-900/30' : 'hover:bg-gray-800/80'}`}
              onClick={() => {
                setSelectedChat(chat.id);
                setIsNewChat(false);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold truncate max-w-[120px]">{chat.title}</span>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="hover:text-green-400 p-1 rounded"><FiEdit2 size={16} /></button>
                  <button className="hover:text-red-400 p-1 rounded"><FiTrash2 size={16} /></button>
                  <button className="hover:text-yellow-400 p-1 rounded"><FiArchive size={16} /></button>
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
            </div>
          )) : (
            <div className="text-gray-400 text-sm">No chats yet.</div>
          )}
        </div>
        {/* Green vertical divider */}
        <div className="absolute top-0 right-0 h-full w-1 bg-green-500 rounded-l-xl shadow-lg" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <nav className="bg-white dark:bg-zinc-900 shadow flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-2xl font-bold text-green-500 tracking-tight select-none">ChatWithData</div>
          <div className="relative" ref={settingsRef}>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-200 font-medium shadow"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <FiSettings className="text-xl" />
              <FiChevronDown className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg py-2 z-50 border border-zinc-200 dark:border-zinc-800 animate-fade-in">
                <button
                  onClick={handleDeleteAllChats}
                  className="block w-full text-left px-6 py-3 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-zinc-700 dark:text-zinc-200"
                >
                  Delete All Chats
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="block w-full text-left px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                >
                  Delete Account
                </button>
                <button
                  onClick={handleArchiveChats}
                  className="block w-full text-left px-6 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors text-yellow-600 dark:text-yellow-400"
                >
                  Archive All Chats
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col gap-4 p-8 overflow-y-auto bg-gray-50 dark:bg-zinc-900">
          {currentChat ? (
            <div className="flex flex-col gap-4">
              {currentChat.messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`max-w-[70%] px-6 py-4 rounded-2xl shadow-md text-base font-medium whitespace-pre-line ${
                    message.isUser
                      ? 'ml-auto bg-green-500 text-white rounded-br-2xl'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-2xl'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-lg select-none">
              <span className="mb-2">Select a chat or start a new one</span>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        {isNewChat && (
          <div
            {...getRootProps()}
            className={`p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragActive ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-300 text-base font-medium">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop a file here, or click to select'}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                Supported formats: <span className="font-semibold text-green-600 dark:text-green-400">.txt, .pptx, .docx, .md, .pdf</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 
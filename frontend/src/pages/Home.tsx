import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiSettings,
  FiEdit2,
  FiTrash2,
  FiArchive,
  FiChevronDown,
  FiLoader,
} from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import "./home.css";

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
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"default" | "light" | "dark">("default");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const { logout } = useAuth();
  const settingsRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: () => chatAPI.getHistory().then((res) => res.data),
  });

  const { data: currentChat } = useQuery({
    queryKey: ["chat", selectedChat],
    queryFn: () =>
      selectedChat
        ? chatAPI.getChat(selectedChat).then((res) => res.data)
        : null,
    enabled: !!selectedChat,
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (!isNewChat) {
      toast.error("File upload is only allowed at the start of a new chat");
      return;
    }
    const file = acceptedFiles[0];
    const allowedTypes = [".txt", ".pptx", ".docx", ".md", ".pdf"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(
        "Invalid file type. Please upload .txt, .pptx, .docx, .md, or .pdf files."
      );
      return;
    }
    try {
      await chatAPI.uploadFile(file);
      setIsNewChat(false);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleDeleteAllChats = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all chats? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading("deleteAll");
    try {
      await chatAPI.deleteAllChats();
      await refetchHistory();
      setSelectedChat(null);
      setIsNewChat(true);
      toast.success("All chats deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete chats");
    } finally {
      setIsLoading(null);
      setSettingsOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading("deleteAccount");
    try {
      await chatAPI.deleteAccount();
      toast.success("Account deleted successfully");
      logout();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsLoading(null);
      setSettingsOpen(false);
    }
  };

  const handleArchiveChats = async () => {
    if (!window.confirm("Are you sure you want to archive all chats?")) {
      return;
    }

    setIsLoading("archive");
    try {
      await chatAPI.archiveChats();
      await refetchHistory();
      toast.success("All chats archived successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to archive chats");
    } finally {
      setIsLoading(null);
      setSettingsOpen(false);
    }
  };

  const handleEditChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = chatHistory?.find((c: Chat) => c.id === chatId);
    if (chat) {
      setEditingChat(chatId);
      setNewChatTitle(chat.title);
    }
  };

  const handleSaveEdit = async (chatId: string) => {
    if (!newChatTitle.trim()) {
      toast.error("Chat title cannot be empty");
      return;
    }

    setIsLoading(`edit-${chatId}`);
    try {
      await chatAPI.updateChatTitle(chatId, newChatTitle);
      await refetchHistory();
      toast.success("Chat title updated successfully");
      setEditingChat(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update chat title"
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    setIsLoading(`delete-${chatId}`);
    try {
      await chatAPI.deleteChat(chatId);
      await refetchHistory();
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setIsNewChat(true);
      }
      toast.success("Chat deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      setIsLoading(null);
    }
  };

  const handleArchiveChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(`archive-${chatId}`);
    try {
      await chatAPI.archiveChat(chatId);
      await refetchHistory();
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setIsNewChat(true);
      }
      toast.success("Chat archived successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to archive chat");
    } finally {
      setIsLoading(null);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
        setThemeDropdownOpen(false);
      }
    }
    // Always attach the event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Apply theme
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    if (theme === "light") document.body.classList.add("theme-light");
    if (theme === "dark") document.body.classList.add("theme-dark");
  }, [theme]);

  const renderLoadingSpinner = () => (
    <FiLoader className="animate-spin" size={16} />
  );

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="home-sidebar">
        <h2 className="home-sidebar-title">Chat History</h2>
        <div className="home-chat-list">
          {chatHistory?.length ? (
            chatHistory.map((chat: Chat) => (
              <div
                key={chat.id}
                className={`home-chat-item ${
                  selectedChat === chat.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedChat(chat.id);
                  setIsNewChat(false);
                }}
              >
                <div className="home-chat-header">
                  {editingChat === chat.id ? (
                    <input
                      type="text"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(chat.id);
                        } else if (e.key === "Escape") {
                          setEditingChat(null);
                        }
                      }}
                      className="home-chat-title-input"
                      autoFocus
                    />
                  ) : (
                    <span className="home-chat-title">{chat.title}</span>
                  )}
                  <div className="home-chat-actions">
                    <button
                      className="home-chat-action-btn"
                      onClick={(e) => handleEditChat(chat.id, e)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === `edit-${chat.id}` ? (
                        renderLoadingSpinner()
                      ) : (
                        <FiEdit2 size={16} />
                      )}
                    </button>
                    <button
                      className="home-chat-action-btn delete"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === `delete-${chat.id}` ? (
                        renderLoadingSpinner()
                      ) : (
                        <FiTrash2 size={16} />
                      )}
                    </button>
                    <button
                      className="home-chat-action-btn archive"
                      onClick={(e) => handleArchiveChat(chat.id, e)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === `archive-${chat.id}` ? (
                        renderLoadingSpinner()
                      ) : (
                        <FiArchive size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="home-chat-message">{chat.lastMessage}</p>
              </div>
            ))
          ) : (
            <div className="home-chat-message">No chats yet.</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="home-main">
        {/* Navbar */}
        <nav className="home-navbar">
          <div className="home-navbar-title">ChatWithData</div>
          <div style={{ position: "relative" }} ref={settingsRef}>
            <button
              className="home-settings-btn"
              onClick={() => setSettingsOpen((prev) => !prev)}
              type="button"
            >
              <FiSettings className="text-xl" />
              <FiChevronDown
                className={`transition-transform ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {settingsOpen && (
              <div className="home-settings-dropdown">
                <button
                  onClick={handleDeleteAllChats}
                  className="home-settings-item"
                  disabled={isLoading !== null}
                >
                  {isLoading === "deleteAll"
                    ? renderLoadingSpinner()
                    : "Delete All Chats"}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="home-settings-item delete"
                  disabled={isLoading !== null}
                >
                  {isLoading === "deleteAccount"
                    ? renderLoadingSpinner()
                    : "Delete Account"}
                </button>
                <button
                  onClick={handleArchiveChats}
                  className="home-settings-item archive"
                  disabled={isLoading !== null}
                >
                  {isLoading === "archive"
                    ? renderLoadingSpinner()
                    : "Archive All Chats"}
                </button>
                <button
                  className="home-settings-item"
                  onClick={() => setThemeDropdownOpen((v) => !v)}
                  type="button"
                >
                  Theme
                  <FiChevronDown
                    className={`transition-transform ${
                      themeDropdownOpen ? "rotate-180" : ""
                    }`}
                    style={{ float: "right" }}
                  />
                </button>
                {themeDropdownOpen && (
                  <div style={{ paddingLeft: "1.5rem", paddingTop: "0.5rem" }}>
                    <button
                      className="home-settings-item"
                      style={{
                        fontWeight: theme === "default" ? "bold" : "normal",
                      }}
                      onClick={() => {
                        setTheme("default");
                        setThemeDropdownOpen(false);
                      }}
                    >
                      Default
                    </button>
                    <button
                      className="home-settings-item"
                      style={{
                        fontWeight: theme === "light" ? "bold" : "normal",
                      }}
                      onClick={() => {
                        setTheme("light");
                        setThemeDropdownOpen(false);
                      }}
                    >
                      Light
                    </button>
                    <button
                      className="home-settings-item"
                      style={{
                        fontWeight: theme === "dark" ? "bold" : "normal",
                      }}
                      onClick={() => {
                        setTheme("dark");
                        setThemeDropdownOpen(false);
                      }}
                    >
                      Dark
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Chat Area */}
        <div className="home-chat-area">
          {currentChat ? (
            <div className="flex flex-col gap-4">
              {currentChat.messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`home-message ${message.isUser ? "user" : "bot"}`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              <span>Select a chat or start a new one</span>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        {isNewChat && (
          <div
            {...getRootProps()}
            className={`home-upload-area ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            <div>
              <p className="home-upload-text">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag and drop a file here, or click to select"}
              </p>
              <p className="home-upload-hint">
                Supported formats:{" "}
                <strong>.txt, .pptx, .docx, .md, .pdf</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

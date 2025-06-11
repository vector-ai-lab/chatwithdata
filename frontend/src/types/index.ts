export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Chat {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    messages: Message[];
}

export interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
}

export interface FileUploadResponse {
    success: boolean;
    message: string;
    chatId?: string;
} 
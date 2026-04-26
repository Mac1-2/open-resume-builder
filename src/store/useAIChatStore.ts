import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type ChatMessage } from '@/components/ai/AIChat';
import { generateId } from '@/lib/utils';

export interface Suggestion {
  id: string;
  type: 'insert' | 'replace' | 'delete' | 'suggest';
  section: string;
  field?: string;
  currentContent?: string;
  suggestedContent: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ChatWithMessages {
  id: string;
  resumeId?: string | null;
  userId?: string | null;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIChatStore {
  chats: ChatWithMessages[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  activeSuggestions: Suggestion[];
  currentResumeId: string | null;

  // Actions
  createChat: (resumeId?: string) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  loadChats: (userId?: string, resumeId?: string) => Promise<void>;
  clearChats: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResumeContext: (resumeId: string | null) => void;
  addSuggestion: (suggestion: Suggestion) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
}

export const useAIChatStore = create<AIChatStore>()(
  devtools(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,
      error: null,
      activeSuggestions: [],
      currentResumeId: null,

      createChat: async (resumeId?: string) => {
        const localId = generateId();
        const newChat: ChatWithMessages = {
          id: localId,
          resumeId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: localId,
          currentResumeId: resumeId || null,
        }));

        // Try to persist via API; silently fail if no backend available
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [],
              resumeId,
            }),
          });
          if (!res.ok) throw new Error('Failed to persist chat');
        } catch {
          // Ignore; running in client-only or demo mode
        }
      },

      setCurrentChat: (chatId) => set({ currentChatId: chatId }),

      addMessage: async (chatId, messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));

        // Optional persistence (does not block UI)
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [message],
              resumeId: chatId,
            }),
          });
        } catch {
          // ignore; client-only mode acceptable
        }
      },

      loadChats: async () => {
        // Best-effort load via API; fall back to empty
        try {
          const res = await fetch('/api/chat');
          if (res.ok) {
            // Not implemented in API currently; skip
          }
        } catch {
          // ignore
        }
      },

      clearChats: () => set({ chats: [], currentChatId: null, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setResumeContext: (resumeId) => set({ currentResumeId: resumeId }),

      addSuggestion: (suggestion) =>
        set((state) => ({
          activeSuggestions: [...state.activeSuggestions, suggestion],
        })),

      removeSuggestion: (id) =>
        set((state) => ({
          activeSuggestions: state.activeSuggestions.filter((s) => s.id !== id),
        })),

      clearSuggestions: () => set({ activeSuggestions: [] }),
    }),
    {
      name: 'ai-chat-store',
    }
  )
);

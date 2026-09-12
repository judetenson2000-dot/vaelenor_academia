import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  Compass,
  FileText,
  BookOpen,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { PaperData, ChatMessage, AdvisorRole } from '../types';

interface GeminiAdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  paperData: PaperData;
  onApplyAbstract?: (newAbstract: string) => void;
  onApplyTitle?: (newTitle: string) => void;
  onAppendModules?: (moduleText: string) => void;
}

const INITIAL_MESSAGES: Record<AdvisorRole, ChatMessage> = {
  mentor: {
    id: 'init-mentor',
    role: 'assistant',
    content: `Hello! I am your **Thesis & Project Advisor**.

I understand that college thesis and project documentation can feel overwhelming — especially with IEEE formatting rules and tight submission deadlines. 

Here at **Vaelenor**, everything is **100% free and open for every student** — no paywalls, no subscriptions, just ethical guidance.

How can I help you today?
- Review or sharpen your **Abstract**
- Formulate your **Problem Statement & Objectives**
- Structure your **System Architecture (§1)**
- Prepare for your **Viva / Oral Defense**`,
    timestamp: 'Just now',
    modelUsed: 'gemini-3.8-flash',
  },
  proofreader: {
    id: 'init-proofreader',
    role: 'assistant',
    content: `I'm your **Speed Academic Proofreader** powered by Gemini Flash Lite.

Paste any rough paragraph, abstract draft, or architecture description, and I will instantly:
1. Elevate it to formal, objective IEEE scientific tone.
2. Eliminate passive voice clutter and informal phrases.
3. Keep technical terminology precise.`,
    timestamp: 'Just now',
    modelUsed: 'gemini-3.1-flash-lite',
  },
  critic: {
    id: 'init-critic',
    role: 'assistant',
    content: `Greetings! I am your **Peer Reviewer & Defense Critic**.

My role is to ask the tough questions *before* your professor or committee does:
- Are your empirical claims backed by experimental data?
- What are the architectural trade-offs and edge cases?
- Is your literature review grounded in foundational work?

Tell me about your approach or share an excerpt to stress-test your thesis.`,
    timestamp: 'Just now',
    modelUsed: 'gemini-3.5-flash',
  },
  methodologist: {
    id: 'init-methodologist',
    role: 'assistant',
    content: `Welcome! I am your **Empirical Methodology & Mathematical Architect**.

I can help you:
- Formulate **LaTeX mathematical models and governing equations** for your project.
- Select independent vs. dependent variables for empirical validation.
- Choose whether a Line, Bar, or Area chart best proves your latency/throughput.
- Frame rigorous ablation studies and baseline comparisons.`,
    timestamp: 'Just now',
    modelUsed: 'gemini-3.8-flash',
  },
};

const SUGGESTED_QUESTIONS = [
  'Help me formulate a LaTeX mathematical equation for my model.',
  'How can I improve my Abstract for IEEE compliance?',
  'What are 3 critical oral defense questions a professor might ask?',
  'Help me break down my project into 4 modular subsystems.',
  'How do I write a compelling Problem Statement?',
  'Check my keywords and suggest standard IEEE taxonomy terms.',
];

export const GeminiAdvisorChat: React.FC<GeminiAdvisorChatProps> = ({
  isOpen,
  onClose,
  paperData,
  onApplyAbstract,
  onApplyTitle,
  onAppendModules,
}) => {
  const [role, setRole] = useState<AdvisorRole>('mentor');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGES.mentor]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Default models per role
  const getModelForRole = (currentRole: AdvisorRole): string => {
    switch (currentRole) {
      case 'proofreader':
      case 'mentor':
      case 'methodologist':
      case 'critic':
      default:
        return 'gemini-3.1-flash-lite';
    }
  };

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Switch role handler
  const handleRoleChange = (newRole: AdvisorRole) => {
    setRole(newRole);
    const newModel = getModelForRole(newRole);
    setSelectedModel(newModel);
    // Append greeting if switching or keep existing thread
    setMessages((prev) => {
      return [...prev, INITIAL_MESSAGES[newRole]];
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          role,
          paperContext: {
            title: paperData.title,
            abstract: paperData.abstract,
            keyModules: paperData.keyModules,
            keywords: paperData.keywords,
            boundResearchCount: paperData.boundResearch.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Advisor Connection Notice**: Could not reach the Gemini service (${err.message || 'Network error'}).\n\n*Tip for students: You can configure your \`GEMINI_API_KEY\` in Settings > Secrets. You can also continue using all manual citation, graphing, and PDF generation tools completely free!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'offline',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGES[role]]);
  };

  // Helper to extract clean text from potential blockquotes or code blocks
  const extractCleanQuote = (content: string): string => {
    // Try to find blockquoted text or full paragraph
    const quoteMatch = content.match(/>\s*([\s\S]+?)(?=\n\n|$)/);
    if (quoteMatch && quoteMatch[1]) {
      return quoteMatch[1].replace(/^>\s*/gm, '').trim();
    }
    // Or return first clean paragraph
    const cleaned = content.replace(/###\s*.+/g, '').replace(/```[\s\S]*?```/g, '').trim();
    return cleaned.slice(0, 1000);
  };

  const handleApplyToAbstract = (content: string) => {
    if (!onApplyAbstract) return;
    const cleanText = extractCleanQuote(content);
    onApplyAbstract(cleanText);
    setAppliedNotice('Applied to Abstract!');
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const handleApplyToTitle = (content: string) => {
    if (!onApplyTitle) return;
    // Extract candidate title from quotes or first line
    const match = content.match(/"([^"]+)"/) || content.match(/\*\*([^*]+)\*\*/);
    const title = match ? match[1] : content.split('\n')[0].replace(/^[#\s*"-]+|[#\s*"-]+$/g, '');
    onApplyTitle(title.trim());
    setAppliedNotice('Applied to Paper Title!');
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl border border-slate-300 bg-white flex flex-col ${
        isExpanded
          ? 'inset-4 md:inset-8 rounded-2xl'
          : 'bottom-4 right-4 w-[92vw] sm:w-[460px] md:w-[500px] h-[640px] max-h-[88vh] rounded-2xl'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Gemini Academic Advisor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-turn student thesis mentor & IEEE writing guide
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            title="Clear & Restart Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Model Selector Sub-Bar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        {/* Role Tabs */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('mentor')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
              role === 'mentor'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Thesis Mentor</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('proofreader')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
              role === 'proofreader'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Speed Polish</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('critic')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
              role === 'critic'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Defense Critic</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('methodologist')}
            className={`hidden sm:flex px-2 py-1 rounded-md text-[11px] font-semibold transition items-center gap-1 ${
              role === 'methodologist'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Methods</span>
          </button>
        </div>

        {/* Model Indicator & Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] font-mono font-medium rounded border border-slate-200 bg-white px-1.5 py-0.5 text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (Balanced)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
          </select>
        </div>
      </div>

      {/* Applied Banner Notice */}
      {appliedNotice && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 flex items-center justify-between font-semibold animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 stroke-[3]" />
            {appliedNotice}
          </span>
          <span className="text-[10px] opacity-80">Synced to paper preview</span>
        </div>
      )}

      {/* Ethics Commitment Tagline (Subtle student trust builder) */}
      <div className="px-4 py-1.5 bg-amber-50/50 border-b border-amber-100/60 flex items-center justify-between text-[10.5px] text-amber-900 shrink-0">
        <span className="flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Built for students with open ethics: never monetized, never restricted.</span>
        </span>
        <span className="font-mono text-[9.5px] text-amber-700/70 hidden sm:inline">
          Context: {paperData.title ? `"${paperData.title.slice(0, 20)}..."` : 'Untitled'}
        </span>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-300 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`flex flex-col max-w-[85%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed transition ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  ) : (
                    <div className="prose prose-xs max-w-none prose-slate prose-p:my-1.5 prose-headings:font-bold prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>

                {/* Message Footer Actions (Copy, Apply to Paper, Model Stamp) */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-slate-700 flex items-center gap-0.5 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </button>

                      {/* Direct Apply to Abstract Button */}
                      {onApplyAbstract && msg.content.length > 80 && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleApplyToAbstract(msg.content)}
                            className="text-amber-700 hover:text-amber-900 hover:underline font-semibold flex items-center gap-0.5"
                            title="Set this response as your paper's Abstract"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Apply to Abstract</span>
                          </button>
                        </>
                      )}

                      {/* Direct Apply to Title Button */}
                      {onApplyTitle && (msg.content.includes('Title:') || msg.content.includes('title')) && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleApplyToTitle(msg.content)}
                            className="text-amber-700 hover:text-amber-900 hover:underline font-semibold flex items-center gap-0.5"
                            title="Use suggested title"
                          >
                            <span>Use as Title</span>
                          </button>
                        </>
                      )}

                      {msg.modelUsed && (
                        <span className="font-mono text-[9px] text-slate-400 ml-auto">
                          {msg.modelUsed}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200 px-4 py-3 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Gemini is formulating academic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Student Prompt Chips */}
      <div className="px-3 py-2 border-t border-slate-200/80 bg-white flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 pl-1">
          Suggestions:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 text-slate-700 transition shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your ${role} anything (e.g. "Review my abstract", "Help with viva prep")...`}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none resize-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 font-sans">
          <span>Press Enter to send • Shift+Enter for new line</span>
          <span className="text-amber-800/80 font-medium">Free Student Edition</span>
        </div>
      </div>
    </div>
  );
};

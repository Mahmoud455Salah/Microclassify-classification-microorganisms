import React, { useState, useEffect, useRef } from 'react';
import { Microorganism } from '../types/microbe';
import { Language, TRANSLATIONS } from '../data/i18n';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ShieldAlert,
  Bot,
  User,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  contextOrganismName?: string;
  modelUsed?: string;
  error?: boolean;
  statusCode?: number;
  statusText?: string;
}

interface AskAiFloatingChatProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  contextMicrobe: Microorganism | null;
  onContextMicrobeChange: (microbe: Microorganism | null) => void;
  microorganisms: Microorganism[];
  language: Language;
}

export const AskAiFloatingChat: React.FC<AskAiFloatingChatProps> = ({
  isOpen,
  onOpen,
  onClose,
  contextMicrobe,
  onContextMicrobeChange,
  microorganisms,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      text: isAr
        ? 'مرحباً بك! أنا مساعدك الذكي المتخصص في علم الأحياء الدقيقة (Microbiology AI Specialist). يمكنك سؤالي عن التصنيف الحيوي، تراكيب الجدار الخلوي، آليات مقاومة المضادات الحيوية، الفحوصات الكيميائية الحيوية، أو تفاصيل أي كائن دقيق محدد.'
        : 'Welcome! I am your AI Microbiology Specialist. You can ask me anything about microbial taxonomy, bacterial cell wall biochemistry, antimicrobial resistance (e.g., MRSA, ESBL, CRE), biochemical test reactions (IMViC, catalase, oxidase), or specific organism details.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendQuestion = async (customPrompt?: string) => {
    const query = (customPrompt || inputQuestion).trim();
    if (!query || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextOrganismName: contextMicrobe
        ? `${contextMicrobe.scientificName} (${contextMicrobe.commonName})`
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const payload: { question: string; contextOrganism?: string } = {
        question: query,
      };

      if (contextMicrobe) {
        payload.contextOrganism = `${contextMicrobe.scientificName} (${contextMicrobe.commonName}) - Group: ${contextMicrobe.microbeGroup}, Gram: ${contextMicrobe.morphology.gramStatus}, Shape: ${contextMicrobe.morphology.shape}`;
      }

      const response = await fetch('/api/gemini/ask-microbe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const statusCode = data.statusCode || response.status;
        const statusText = data.statusText || response.statusText || 'ERROR';
        let friendlyMsg = data.error || (isAr ? 'تعذر الحصول على إجابة من المساعد العلمي.' : 'Unable to query microbiology assistant.');

        if (data.errorType === 'MISSING_API_KEY') {
          friendlyMsg = isAr
            ? 'مفتاح API غير متوفر على الخادم. يرجى التحقق من إعدادات البيئة.'
            : 'Gemini API key is not configured on the server. Please check environment configuration.';
        } else if (data.errorType === 'MODEL_UNAVAILABLE') {
          friendlyMsg = isAr
            ? 'خدمة الذكاء الاصطناعي تشهد ضغطاً عالياً حالياً. انقر على "إعادة المحاولة" بعد لحظات.'
            : 'The AI service is currently experiencing high demand. Please click "Try again" in a moment.';
        } else if (data.errorType === 'QUOTA_EXCEEDED') {
          friendlyMsg = isAr
            ? 'تم الوصول إلى الحد المسموح للاستعلامات حالياً. يرجى الانتظار قليلاً.'
            : 'Rate limit or quota reached. Please wait a moment before trying again.';
        }

        const errorMsg: ChatMessage = {
          id: 'error-' + Date.now(),
          role: 'assistant',
          text: friendlyMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
          statusCode,
          statusText,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error('[Ask AI Chat Error]', err);
      let msg = isAr
        ? 'حدث خطأ في الاتصال بشبكة خدمة الذكاء الاصطناعي.'
        : 'Network connection to the AI service was interrupted. Please check your network and retry.';
      
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        text: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
        statusCode: 0,
        statusText: 'NETWORK_ERROR',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendQuestion(lastUserMsg.text);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        role: 'assistant',
        text: isAr
          ? 'تم مسح المحادثة. كيف يمكنني مساعدتك في علم الأحياء الدقيقة الآن؟'
          : 'Chat history cleared. How can I assist you with microbiology topics today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick prompt suggestions depending on whether an organism is selected
  const quickSuggestions = contextMicrobe
    ? [
        isAr
          ? `ما هي آليات الفوعة والإمراضية لـ ${contextMicrobe.scientificName}؟`
          : `Virulence factors and pathogenesis of ${contextMicrobe.scientificName}?`,
        isAr
          ? `ما هي صفات الجدار الخلوي وتفاعل غرام لـ ${contextMicrobe.scientificName}؟`
          : `Cell wall biochemistry & Gram reaction of ${contextMicrobe.scientificName}?`,
        isAr
          ? `كيف نميز ${contextMicrobe.scientificName} في المختبر تفريقياً؟`
          : `Key lab tests to differentiate ${contextMicrobe.scientificName}?`,
        isAr
          ? `ما هي آليات مقاومة الصادات لـ ${contextMicrobe.scientificName}؟`
          : `Antimicrobial resistance mechanisms for ${contextMicrobe.scientificName}?`,
      ]
    : [
        isAr
          ? 'ما هي آلية صبغة غرام وتفسير نتائجها؟'
          : 'How does the Gram stain mechanism work biochemically?',
        isAr
          ? 'قارن بين الذيفانات الداخلية والذيفانات الخارجية (Endotoxins vs Exotoxins)'
          : 'Compare bacterial Endotoxins vs Exotoxins',
        isAr
          ? 'ما هو مبدأ فحص الحساسية كيربي-باور وقراءة CLSI؟'
          : 'Explain Kirby-Bauer disk diffusion and CLSI breakpoints',
        isAr
          ? 'ما الفرق بين الجراثيم المقاومة ESBL و MRSA و CRE؟'
          : 'Differences between MRSA, ESBL, and CRE resistance mechanisms',
      ];

  return (
    <>
      {/* 1. Floating "Ask AI" Button (Bottom-Right Corner, Visible on Every Page) */}
      <div
        className="fixed bottom-5 end-4 sm:bottom-6 sm:end-6 z-40 print:hidden select-none"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          onClick={() => {
            if (isOpen) {
              onClose();
            } else {
              onOpen();
            }
          }}
          aria-label={t.askAiFloatingBtn}
          title={isAr ? 'اسأل الذكاء الاصطناعي عن أي سؤال ميكروبيولوجي' : 'Ask AI any microbiology question'}
          className={`group flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full font-bold text-sm shadow-xl transition-all duration-200 transform active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-blue-300 ${
            isOpen
              ? 'bg-slate-900 text-white ring-2 ring-blue-500 shadow-blue-500/20'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 transition-transform group-hover:rotate-12 duration-200" />
            <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
          </div>

          <span className="font-extrabold tracking-wide whitespace-nowrap">
            {t.askAiFloatingBtn}
          </span>

          {contextMicrobe && (
            <span className="hidden md:inline-block max-w-[120px] truncate text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              {contextMicrobe.scientificName}
            </span>
          )}
        </button>
      </div>

      {/* 2. Interactive Chat Panel & Backdrop */}
      {isOpen && (
        <>
          {/* Backdrop: sibling rendered BEFORE the panel, z-40, pointer-events only for click-to-close */}
          <div
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 pointer-events-auto transition-opacity"
          />

          {/* Panel: separate element rendered AFTER backdrop, z-50, solid background, no blur/filter/reduced opacity */}
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:end-6 z-50 flex flex-col justify-end sm:justify-start pointer-events-none"
          >
            {/* Panel Container: full-screen sheet on mobile (<640px), rounded floating card on desktop */}
            <div className="pointer-events-auto bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col w-full sm:w-[480px] md:w-[520px] h-full sm:h-[620px] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
              
              {/* Header: visible header with close button */}
              <div className="bg-slate-900 dark:bg-slate-950 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-xs border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base leading-tight text-white">
                        {t.askAiPanelTitle}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        Gemini
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {isAr ? 'إجابات علمية موثقة حول التصنيف والمجهرية' : 'Scientific Microbiology Q&A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleClearHistory}
                    title={t.askAiClearChat}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label={t.close}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mandatory Educational Disclaimer Banner */}
              <div className="bg-amber-100 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-3.5 py-2 text-[11px] font-semibold flex items-center gap-2 shrink-0">
                <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>{t.askAiDisclaimerText}</span>
              </div>

              {/* Context Organism Selector Dropdown */}
              <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-2.5 px-3.5 flex items-center gap-2 shrink-0">
                <label
                  htmlFor="chat-organism-select"
                  className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0"
                >
                  {t.askAiSelectContext}
                </label>
                <div className="relative flex-1">
                  <select
                    id="chat-organism-select"
                    value={contextMicrobe?.id || ''}
                    onChange={(e) => {
                      const found = microorganisms.find((m) => m.id === e.target.value);
                      onContextMicrobeChange(found || null);
                    }}
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-1.5 px-2.5 pe-8 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate"
                  >
                    <option value="">{t.askAiGeneralContext}</option>
                    {microorganisms.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.scientificName} ({m.commonName}) - {m.microbeGroup}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {contextMicrobe && (
                  <button
                    onClick={() => onContextMicrobeChange(null)}
                    title={isAr ? 'إلغاء تحديد الكائن' : 'Clear context'}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Messages Body (scrollable) */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50 dark:bg-slate-900/60">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUser
                            ? 'bg-blue-600 text-white'
                            : msg.error
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : msg.error
                            ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {/* Context badge if user sent with specific microbe */}
                        {isUser && msg.contextOrganismName && (
                          <div className="text-[10px] text-blue-100 mb-1 font-semibold flex items-center gap-1 opacity-90">
                            <Info className="w-3 h-3" />
                            <span>{msg.contextOrganismName}</span>
                          </div>
                        )}

                        {/* Message Content */}
                        <div className="whitespace-pre-line font-normal break-words text-slate-900 dark:text-slate-100">
                          {msg.text}
                        </div>

                        {/* Technical detail if error occurred */}
                        {msg.error && (msg.statusCode || msg.statusText) && (
                          <div className="mt-2 pt-2 border-t border-rose-300 dark:border-rose-700 flex items-center justify-between text-[11px] font-mono text-rose-800 dark:text-rose-300">
                            <span>
                              [{msg.statusCode ? msg.statusCode : ''} {msg.statusText || 'ERROR'}]
                            </span>
                            <button
                              onClick={handleRetryLast}
                              className="inline-flex items-center gap-1 font-sans text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline"
                            >
                              <RefreshCw className="w-3 h-3" />
                              {t.askAiTryAgain}
                            </button>
                          </div>
                        )}

                        {/* Model badge & timestamp for AI */}
                        {!isUser && !msg.error && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{msg.timestamp}</span>
                            {msg.modelUsed && (
                              <span className="font-mono text-[9px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                {msg.modelUsed}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span>{t.analyzing}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {isAr
                          ? 'جاري استرجاع البيانات العلمية من نموذج Gemini...'
                          : 'Querying microbiology taxonomy and resistance models...'}
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Suggestions Chips */}
              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 px-3 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex gap-1.5 text-[11px]">
                  {quickSuggestions.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuestion(promptText)}
                      disabled={isLoading}
                      className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium transition-colors disabled:opacity-50 text-start"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar: fixed at the bottom */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuestion();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={t.askAiInputPlaceholder}
                  disabled={isLoading}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isLoading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  )}
                  <span className="hidden sm:inline">{t.send}</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

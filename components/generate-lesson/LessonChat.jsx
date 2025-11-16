// LessonChat.jsx with auto-clear, save chat, and UI effects
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/old-ui/button";
import {
  Loader2,
  X,
  MessageSquare,
  Send,
  ChevronUp,
  Zap,
  BookOpen,
  User,
  Save,
  Clock,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { SpeakingModule } from "./lecture-components";
import { toast } from "sonner";

export default function LessonChat({ sections }) {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [showClearAnimation, setShowClearAnimation] = useState(false);
  const [shouldClearChat, setShouldClearChat] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Use to reset timer
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const abortControllerRef = useRef(null);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Get the entry with the highest intersection ratio
        const mostVisible = entries.reduce(
          (prev, current) =>
            prev && prev.intersectionRatio > current.intersectionRatio
              ? prev
              : current,
          null,
        );

        if (mostVisible && mostVisible.isIntersecting) {
          const sectionId = mostVisible.target.dataset.sectionId;
          const sectionContent = mostVisible.target.dataset.sectionContent;

          if (sectionId && sectionContent) {
            setCurrentSection({
              id: sectionId,
              content: sectionContent,
            });
          }
        }
      },
      { threshold: [0.2, 0.5, 0.8] },
    );

    // Wait a bit for elements to be fully rendered
    setTimeout(() => {
      const sectionElements = document.querySelectorAll("[data-section-id]");
      sectionElements.forEach((element) => {
        observer.observe(element);
      });
    }, 300);

    // Set the first section as default if available
    if (sections.length > 0 && !currentSection) {
      setCurrentSection(sections[0]);
    }

    return () => {
      observer.disconnect();
      // Cancel any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear auto-clear timer
      if (clearTimerRef.current) {
        clearInterval(clearTimerRef.current);
      }
    };
  }, [sections]);

  // Handle clearing chat when timer expires
  useEffect(() => {
    if (shouldClearChat) {
      setShowClearAnimation(true);
      setTimeout(() => {
        setChatHistory([]);
        setShowClearAnimation(false);
        toast.success(
          "Chat has been automatically cleared after 5 minutes of inactivity",
        );
        setShouldClearChat(false);
      }, 800);
    }
  }, [shouldClearChat]);

  const handleTimeUp = () => {
    setShouldClearChat(true);
  };

  useEffect(() => {
    // Scroll to bottom of chat box when history is updated
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    if (!currentSection) {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: chatInput },
        {
          role: "assistant",
          content: "Please scroll to a section to start chatting!",
        },
      ]);
      setChatInput("");
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);

    const assistantMessageId = Date.now().toString();
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "", id: assistantMessageId, loading: true },
    ]);

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setIsStreaming(true);

      const response = await fetch("/api/speak/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentSection.content,
          question: chatInput,
          sectionId: currentSection.id,
          history: chatHistory,
        }),
        signal,
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        assistantResponse += text;

        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantResponse, loading: true }
              : msg,
          ),
        );
      }

      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                role: "assistant",
                content: assistantResponse,
                id: assistantMessageId,
                loading: false,
              }
            : msg,
        ),
      );

      setChatInput("");
      inputRef.current?.focus();
    } catch (error) {
      if (error.name !== "AbortError") {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  role: "assistant",
                  content: "Oops, something went wrong with the request!",
                  id: assistantMessageId,
                  error: true,
                }
              : msg,
          ),
        );
        console.error(error);
      } else {
        setChatHistory((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId),
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const getSectionLabel = () => {
    if (!currentSection) return "No section selected";
    const { id, content } = currentSection;

    if (id.startsWith("exercise-")) {
      try {
        const exercise = JSON.parse(content);
        return `Exercise ${
          parseInt(id.split("-")[1]) + 1
        }: ${exercise.type.replace(/_/g, " ")}`;
      } catch {
        return `Exercise ${parseInt(id.split("-")[1]) + 1}`;
      }
    }

    if (id.startsWith("component-")) {
      try {
        const props = JSON.parse(content);
        const componentName = Object.keys(props)[0] || "Component";
        return `${componentName} Section ${parseInt(id.split("-")[1]) + 1}`;
      } catch {
        return `Section ${parseInt(id.split("-")[1]) + 1}`;
      }
    }

    if (id.startsWith("md-")) {
      const firstLine = content.split("\n")[0].replace(/^#+/, "").trim();
      return firstLine || `Section ${parseInt(id.split("-")[1]) + 1}`;
    }

    if (id.startsWith("conj-group-")) {
      return `Conjugation Group ${parseInt(id.split("-")[2]) + 1}`;
    }

    return id; // Fallback
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChatHistory = () => {
    setShowClearAnimation(true);
    setTimeout(() => {
      setChatHistory([]);
      setShowClearAnimation(false);
    }, 800); // Delay to allow animation to complete
  };

  const saveChat = () => {
    // Format the chat history for saving
    const formattedChat = chatHistory
      .map((msg) => {
        return `${msg.role === "user" ? "You" : "Assistant"}: ${msg.content}`;
      })
      .join("\n\n");

    // Create a blob and download file
    const blob = new Blob([formattedChat], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const InfoComponent = ({ title, content, language }) => {
    return (
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-md">
        {/* Title Section */}
        <div className="flex items-center justify-between rounded-t-md bg-blue-100 px-3 py-2 font-semibold text-blue-800">
          <span className="truncate">{title}</span>
        </div>

        {/* Language Badge */}
        <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {language}
        </span>

        {/* Content Section */}
        <div className="mt-2 text-sm text-gray-800">{content}</div>
      </div>
    );
  };

  // Helper function: splits text into nodes for plain Markdown or custom component blocks.
  const parseContentNodes = (text) => {
    if (!text) return [{ type: "markdown", content: "" }];

    const nodes = [];
    // Updated regex for more reliable matching
    const regex = /\[(\w+)\]\s*\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;

    console.log("Parsing text:", text);

    while ((match = regex.exec(text)) !== null) {
      console.log("Found match:", match);

      // If there is Markdown text before the match, add it as a node
      if (match.index > lastIndex) {
        nodes.push({
          type: "markdown",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Get the component name and data
      const componentName = match[1].toLowerCase();
      let jsonData = match[2].trim();

      // Add the custom component node
      nodes.push({
        type: "custom",
        component: componentName,
        data: jsonData,
      });

      lastIndex = regex.lastIndex;
    }

    // If there is remaining Markdown text after the last match, add it
    if (lastIndex < text.length) {
      nodes.push({
        type: "markdown",
        content: text.substring(lastIndex),
      });
    }

    console.log("Parsed nodes:", nodes);
    return nodes;
  };
  // Helper function: renders nodes either as Markdown or as custom components.
  const renderCustomMarkdown = (text, language) => {
    const nodes = parseContentNodes(text);

    return nodes.map((node, index) => {
      if (node.type === "markdown") {
        return (
          <Markdown
            key={`md-${index}`}
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm max-w-none"
            components={{
              table: ({ node, ...props }) => (
                <table className="markdown-table" {...props} />
              ),
              thead: ({ node, ...props }) => <thead {...props} />,
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => <tr {...props} />,
              th: ({ node, ...props }) => <th {...props} />,
              td: ({ node, ...props }) => <td {...props} />,
            }}
          >
            {node.content}
          </Markdown>
        );
      } else if (node.type === "custom") {
        const Component = componentMap[node.component];

        if (!Component) {
          return (
            <div
              key={`unknown-${index}`}
              className="my-2 rounded border border-red-300 bg-red-50 p-2"
            >
              <p className="text-red-500">
                Unknown component: {node.component}
              </p>
            </div>
          );
        }

        try {
          console.log(`Parsing JSON for ${node.component}:`, node.data);
          const parsedData = JSON.parse(`{${node.data}}`);
          console.log("Parsed data:", parsedData);

          return (
            <div key={`component-${index}`}>
              <Component {...parsedData} language={language} />
            </div>
          );
        } catch (error) {
          console.error(`Error parsing JSON for ${node.component}:`, error);

          // Try to manually extract properties as a fallback
          try {
            const manualProps = {};
            const propMatches = node.data.match(/"(\w+)":\s*"([^"]*)"/g);

            if (propMatches) {
              propMatches.forEach((propMatch) => {
                const [key, value] = propMatch
                  .split(":")
                  .map((s) => s.trim().replace(/"/g, ""));
                manualProps[key] = value;
              });

              console.log("Manually extracted props:", manualProps);
              return (
                <div key={`component-${index}`}>
                  <Component {...manualProps} language={language} />
                </div>
              );
            }
          } catch (fallbackError) {
            console.error("Fallback extraction failed:", fallbackError);
          }

          return (
            <div
              key={`error-${index}`}
              className="my-2 rounded border border-red-300 bg-red-50 p-2"
            >
              <p className="text-red-500">
                Error parsing {node.component} data: {error.message}
              </p>
              <pre className="mt-1 overflow-auto text-xs">{node.data}</pre>
            </div>
          );
        }
      }
      return null;
    });
  };

  const TalkingModule = ({ text, language, speaker }) => {
    const downloadChatHistory = () => {
      console.log("Button Clicked");
    };
    return (
      <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-1.5">
            <Zap size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-700">
            Speech Module For Something Cool({language || "french"})
          </span>
        </div>

        <div className="mb-2 text-sm text-gray-700">{text}</div>

        <SpeakingModule
          text={text}
          language={language || "french"}
          speaker={speaker || "girl"}
          customCss="speak"
        />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={downloadChatHistory}
          className="text-sm text-blue-700 hover:text-blue-800"
        >
          Download Chat History
        </Button>
      </div>
    );
  };

  const componentMap = {
    info: InfoComponent,
    talking: TalkingModule,
    // Add more custom components here...
  };

  if (isMinimized) {
    return (
      <button
        onClick={toggleMinimize}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-blue-600"
        aria-label="Open chat"
      >
        <div className="relative">
          <MessageSquare size={22} className="text-white" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-green-400"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300">
      {/* Inject custom styles for tables */}
      <style>{`
        .markdown-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-table th,
        .markdown-table td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.8); }
        }
        
        .clear-animation {
          animation: fadeOut 0.8s ease-out forwards;
        }
      `}</style>

      {/* Header - Centered */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Optional Icon - Uncomment if you want an icon */}
          {/* <Zap size={16} className="text-white" /> */}
          <span className="flex items-center gap-2 text-xl font-light text-white">
            <MessageSquare strokeWidth={1.5} className="fill-white" /> Chat
          </span>
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              className="h-8 w-8 rounded-full bg-white/20 p-0 text-white transition-all duration-300 hover:rotate-180 hover:bg-white/30"
            >
              <ChevronUp size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Section indicator */}
      <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50 px-5 py-2.5">
        <BookOpen size={16} className="text-indigo-600" />
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-indigo-800">
          {getSectionLabel()}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {chatHistory.length > 0 && (
            <>
              <TimerDisplay
                key={timerKey}
                initialTime={5 * 60}
                onTimeUp={handleTimeUp}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={saveChat}
                className="h-7 border-green-200 bg-green-50 px-2 text-xs text-green-600 hover:bg-green-100"
              >
                <Save size={12} className="mr-1" /> Save
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearChatHistory}
            className="h-7 border-red-200 bg-red-50 px-2 text-xs text-red-600 hover:bg-red-100"
            disabled={chatHistory.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={chatBoxRef}
        className="h-80 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-5 py-4"
        style={{ scrollBehavior: "smooth" }}
      >
        <AnimatePresence>
          {chatHistory.length > 0 ? (
            <motion.div
              className={`space-y-4 ${
                showClearAnimation ? "clear-animation" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "rounded-tr-none bg-indigo-100 text-indigo-900"
                        : "rounded-bl-none bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.loading ? (
                      <div className="flex items-center gap-2">
                        {/* Render custom Markdown while loading */}
                        {renderCustomMarkdown(message.content, "french")}
                        <Loader2 className="ml-1 h-3 w-3 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      /* Render Markdown for completed messages */
                      <>
                        {renderCustomMarkdown(message.content, "french")}
                        {/* {message.role !== "user" && (
                        <SpeakingModule 
                          text={message?.content} 
                          language="french" 
                          speaker="girl" 
                          customCss="speak" 
                        />
                      )} */}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="flex h-full flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <MessageSquare size={20} className="text-indigo-600" />
              </div>
              <p className="mb-1 text-gray-500">
                Ask about the current section!
              </p>
              <p className="text-xs text-gray-400">
                I can explain concepts, answer questions, and provide examples.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && handleChatSubmit()
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pr-10 text-sm placeholder-gray-400 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Type your question..."
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              </div>
            )}
          </div>

          {isStreaming ? (
            <Button
              onClick={cancelStream}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 p-0 text-white shadow-sm hover:bg-red-600"
            >
              <X size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleChatSubmit}
              disabled={!chatInput.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 p-0 text-white shadow-sm transition-all hover:from-indigo-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} className="text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TimerDisplay({ onTimeUp, initialTime = 300 }) {
  const [timeLeft, setTimeLeft] = useState(initialTime); // Store seconds directly
  const timerRef = useRef(null);

  useEffect(() => {
    // Set up the interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onTimeUp]); // Only re-run if onTimeUp changes

  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  return (
    <div className="flex items-center text-xs text-gray-500">
      <Clock size={12} className="mr-1" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}

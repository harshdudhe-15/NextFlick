import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ChatPage.scss";
import ApiService, {startConversation} from "../../../../services/Api.service";
import { PulseLoader } from "react-spinners";
import MovieCard from "./ChatPage_components/MovieCard";
import { getVariable, setVariable } from "../../../../utils/localStorage"; 

const ChatPage = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bottomRef = useRef(null);

  const botId = searchParams.get("id");
  const namespaceId = searchParams.get("namespace_id");
  const initialPrompt = searchParams.get("prompt");

  const storageKey = `chat_session_${botId}`;
  
  // const [messages, setMessages] = useState([
  //   {
  //     question: "",
  //     Ai_response: "Hello, How can I help you today?",
  //   },
  // ]);
  const [messages, setMessages] = useState(() => {
    const saved = getVariable(storageKey);
    return saved && Array.isArray(saved)
      ? saved
      : [
          {
            question: "",
            Ai_response: "Hello, How can I help you today?",
            movies: []
          },
        ];
  });
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const hasAutoSent = useRef(false);

  // ============================
  // SEND MESSAGE (SINGLE SOURCE)
  // ============================
  // const sendMessage = async (message) => {
  //   if (!message.trim() || loading) return;

  //   setLoading(true);

  //   // USER MESSAGE
  //   setMessages((prev) => [...prev, { question: message, Ai_response: "" }]);
  //   setInput("");

  //   try {
  //     const payload = {
  //       question: message,
  //       namespace_id: namespaceId,
  //       chatHistory: messages,
  //     };

  //     await startConversation(payload, (chunk) => {
  //       const chunkText =
  //         typeof chunk === "string"
  //           ? chunk
  //           : chunk?.text ??
  //             chunk?.Ai_response ??
  //             chunk?.data ??
  //             JSON.stringify(chunk);

  //       setMessages((prev) => {
  //         const lastIdx = prev.length - 1;

  //         // append AI stream
  //         if (prev[lastIdx]?.question === "") {
  //           const updated = [...prev];
  //           updated[lastIdx] = {
  //             ...updated[lastIdx],
  //             Ai_response:
  //               (updated[lastIdx].Ai_response || "") + chunkText,
  //           };
  //           return updated;
  //         }

  //         // first AI chunk
  //         return [...prev, { question: "", Ai_response: chunkText }];
  //       });
  //     });
  //     } catch (err) {
  //       console.error("Streaming error:", err);
  //       setMessages((prev) => [
  //         ...prev,
  //         { question: "", Ai_response: "⚠️ Error receiving response." },
  //       ]);
  //     } finally {
  //       setLoading(false);
  //     }
  // };

  const sendMessage = async (message) => {
    if (!message.trim() || loading) return;

    setLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      { question: message, Ai_response: "" }
    ]);

    setInput("");

    try {
      const payload = {
        question: message,
        namespace_id: namespaceId,
        chatHistory: messages,
      };

      // 🔥 IMPORTANT — normal API call (no streaming)
      const response = await ApiService.post("chat-bot/chat", payload);

      const data = response.data;

      setMessages((prev) => [
        ...prev,
        {
          question: "",
          Ai_response: data.message || "",
          movies: data.movies || []
        }
      ]);

    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { question: "", Ai_response: "⚠️ Error receiving response." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;
  //   setLoading(true);
 
  //   setMessages((prev) => [...prev, { question: input, Ai_response: "" }]);

  //   try {
  //     let payload = {
  //       question: input,
  //       namespace_id: searchParams.get("namespace_id"),
  //       chatHistory: messages,
  //     };
  //     setInput("");

  //     await startConversation(payload, (chunk) => {
  //       const chunkText =
  //         typeof chunk === "string"
  //           ? chunk
  //           : chunk?.text ??
  //             chunk?.Ai_response ??
  //             chunk?.data ??
  //             JSON.stringify(chunk);

  //       setMessages((prev) => {
  //         const lastIdx = prev.length - 1;

  //         if (lastIdx < 0) return prev;

  //         const updated = [...prev];
  //         const last = { ...updated[lastIdx] };

  //         if (last.question === "") {
  //           last.Ai_response = (last.Ai_response || "") + chunkText;
  //           updated[lastIdx] = last;

  //           return updated;
  //         }

  //         return [...prev, { question: "", Ai_response: chunkText }];
  //       });
  //     });
  //   } catch (err) {
  //     console.error("Streaming error:", err);
  //     setMessages((prev) => [
  //       ...prev,
  //       { question: "", Ai_response: "⚠️ Error receiving response." },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ====================================
  // AUTO SEND INITIAL PROMPT (ONCE)
  // ====================================
  useEffect(() => {
  if (!initialPrompt || hasAutoSent.current) return;

  hasAutoSent.current = true;

  sendMessage(initialPrompt);

  // clear prompt from URL
  navigate(
    `/default/chat?id=${botId}&namespace_id=${namespaceId}`,
    { replace: true }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // ============================
  // PERSIST CHAT SESSION
  // ============================
  useEffect(() => {
    setVariable(storageKey, messages);
  }, [messages, storageKey]);
  
  /* ============================
     🔒 DISABLE PAGE SCROLL
  ============================ */
  useEffect(() => {

    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  
  // ============================
  // AUTO SCROLL TO BOTTOM
  // ============================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const formatResponse = (text) => {
    return text
      .replace(/For More Reference:/g, "\n\nFor More Reference:\n")
      .replace(/•/g, "\n•")
      .replace(/\. /g, ".\n")
      .replace(/- /g, "\n -")
      .trim();
  };

  return (
    <div className="chat-page container-fluid py-3">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-md-10 page">
          <div className="card chat-card shadow-sm rounded-4">
            <div className="chat-header border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-primary mb-0">NEXTFLICK – AI That Knows What You’ll Love🤖</h5>
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => navigate(-1)}
              >
                ← Back
              </Button>
            </div>

            <div className="chat-body px-3 py-4" >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-row ${
                    msg.question ? "user" : "bot"
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      msg.question ? "user-msg" : "bot-msg"
                    }`}
                    style={{ display: "block" }}
                  >
                    {msg.question && (
                      <div className="font-semibold">{msg.question}</div>
                    )}

                    {/* {msg.Ai_response && (
                      <div
                        className="whitespace-pre-line text-left"
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.6",
                        }}
                      >
                        {formatResponse(msg.Ai_response)}
                      </div>
                    )} */}
                    {msg.Ai_response && (
                      <div
                        className="whitespace-pre-line text-left"
                        style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                      >
                        {formatResponse(msg.Ai_response)}
                      </div>
                    )}

                    {/* 🎬 Movie Cards */}
                    {msg.movies && msg.movies.length > 0 && (
                      <div style={{ marginTop: "20px" }}>
                        {msg.movies.map((movie) => (
                          <div key={movie.id} style={{ marginBottom: "20px" }}>
                            <MovieCard movie={movie} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-start mt-2 message-row bot">
                  <div className="bot-msg d-inline-block px-3 py-1 rounded-4 bg-light message-bubble bot-msg typing">
                    <PulseLoader
                      color="#e50914"
                      size={8}
                      margin={4}
                      speedMultiplier={0.7}
                    />
                  </div>
                </div>
              )}
              {/* ✅ SCROLL TARGET — THIS IS KEY */}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input border-top px-3 py-3">
              <form className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="form-control rounded-pill px-3"
                  disabled={loading}
                />
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                  disabled={loading}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

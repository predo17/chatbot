import ChatbotIcon from "./components/chatboticon"
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { useEffect, useRef, useState } from "react";


const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [savedConversations, setSavedConversations] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const showSavedList = useRef(null); 

  const chatBodyRef = useRef();
  const [isUserScrooling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasUserScrolledManually, setHasUserScrolledManually] = useState(false);
  const [scrollLock, setScrollLock] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);  

  const [darkMode, setDarkMode] = useState(() =>{
    return localStorage.getItem("theme") === "dark";
  });

  const generateBotResponse = async (history) => {
  setChatHistory((prev) => [...prev, { role: "model", text: "Por favor aguarde..." }]);

  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: formattedHistory }),
  };

  try {
    const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "Algo deu errado");

    const apiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.replace(/\*\*(.*?)\*\*/g, "$1")
      .trim() || "";
    
    typeWriterEffect(apiResponseText);
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    
    setChatHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "model", text: "❌ Erro ao responder." };
      return updated;
      });
    }
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };
 
const typeWriterEffect = (fullText) => {
  let index = 0;
  const typingSpeed = 25;

  setScrollLock(true);
  setIsTyping(true);
  

  let typedText = "";
  let finalChatHistory = [];

    const interval = setInterval(() => {
      if (index <= fullText.length) {
        typedText = fullText.slice(0, index);

        setChatHistory((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "model") {
           updated[updated.length - 1] = { role: "model", text: typedText };
          }
          finalChatHistory = updated;
          return updated;
        });

        index++;
      } else {
        clearInterval(interval);
        setScrollLock(false);
        setIsTyping(false);

        setTimeout(async () => {
          await saveConversation(finalChatHistory);
        }, 100);
        

      }
    }, typingSpeed);
  };

  useEffect(() => {
   if (!isTyping && chatHistory.length > 0 && !isLoadingHistory) {

  }
  }, [chatHistory, isTyping, isLoadingHistory]);

const saveConversation = async (messages = chatHistory) => {
  if (!messages || messages.length === 0) return;

  try {
    const firstUserMessage = chatHistory.find(msg => msg.role === "user");
    const title = firstUserMessage?.text?.slice(0, 50) || "Nova conversa";

    const method = currentConversationId ? "PUT" : "POST";
    const url = currentConversationId
      ? `http://localhost:4000/api/chat/${currentConversationId}`
      : "http://localhost:4000/api/chat";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, messages }),
    });

    const result = await response.json();
    if (!currentConversationId && result.id) {
      setCurrentConversationId(result.id); 
      }
    } catch (error) {
      console.error("Erro ao salvar conversa:", error);
    }
  };

  const handleSendMessage = async (userMessage) => {
  const newUserMessage = { role: "user", text: userMessage };

  const updatedHistory = [...chatHistory, newUserMessage];
  setChatHistory(updatedHistory);

  // Salva logo após o envio do usuário
  await saveConversation(updatedHistory);

  // Depois segue com chamada da IA e animação de digitação...
};



  const startNewChat = () => {
    setChatHistory([]);
    setCurrentConversationId(null); 
  };

  const fetchSavedConversations = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/chat");
      const data = await res.json();
      setSavedConversations(data);
    } catch (error) {
      console.error("Erro ao buscar conversas salvas:", error);
    }
  };

 const deleteConversation = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta conversa?");

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:4000/api/chat/${id}`, { method: "DELETE" });
      setSavedConversations(prev => prev.filter(conv => conv.id !== id));

      if (id === currentConversationId) {
        setChatHistory([]);
        setCurrentConversationId(null);
      }

      } catch (error) {
        console.error("Erro ao deletar conversa:", error);
      }
  };

  useEffect(() => { 
    const btn = document.getElementById("btn-focus");
    if (btn) {
      btn.addEventListener("click", fetchSavedConversations);
    }

    return () => {
      if (btn) {
        btn.removeEventListener("click", fetchSavedConversations);
      }
    };
  }, []);

  const handleScroll = () => {
    const chatBody = chatBodyRef.current;
    const isAtBottom = chatBody.scrollHeight - chatBody.scrollTop <= chatBody.clientHeight + 10;

    if (scrollLock) return;

      if (!isAtBottom) {
      setHasUserScrolledManually(true);
      setShowScrollButton(true);
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }
  };

  const scrollToButton = () =>{
    
    setHasUserScrolledManually(false);
    setShowScrollButton(false);
    setScrollLock(true);

    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth"});

    setTimeout(() =>{
      setScrollLock(false);

      handleScroll();
    }, 500);

  };

  const loadConversation = (messages, id) => {
  setChatHistory(messages);
  setCurrentConversationId(id);
  setShowSavedList(false);
  };

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    chatBody.addEventListener("scroll", handleScroll);

      return () => {
        chatBody.removeEventListener("scroll", handleScroll);
      };
  }, []);

  useEffect(() => {
    if (!isUserScrooling) {
      const chatBody = chatBodyRef.current;
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);

   useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/chat");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
        const lastConversation = data[data.length - 1];
        setChatHistory(lastConversation.messages || []);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico do chat:", err);
      }finally {
      setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, []);


  useEffect(() => {
  const body = document.body;

  if (darkMode) {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
  } else {
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
  }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
   <div className={`container ${darkMode ? "dark" : "light"}`}>
    <div className="chatbot-popup">
      <div className="chat-header">
        <div className="header-info">
          <ChatbotIcon />
          <h2 className="logo-chat">ChatBot</h2>
        </div>

           <div className="chat-buttons">
             <button id="btn-focuss" className="bi bi-chat-dots" onClick={startNewChat}></button>
             <button id="btn-focus" className="bi bi-card-text" onClick={() => setShowSaved(!showSaved)}></button>

              <div className="chat-climate" onClick={() => setDarkMode(!darkMode)}>
                <span>
                  <i className={darkMode ? " bi bi-brightness-high-fill" : "bi bi-moon"}></i>
                </span>
              </div>
           </div>

          <div
              ref={showSavedList}
              className={`saved-conversations ${showSaved ? "visible" : "hidden"}`}
            >
              <div className="conversation-header">
                <h1>Histórico</h1>
                <i
                  className="bi bi-x-lg"
                  onClick={() => setShowSaved(false)}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>

              {savedConversations.map((conv) => (
                <div key={conv.id} className="conversation-card">
                  <h4>{conv.title}</h4>
                  <div className="conversation-btn">
                    <button onClick={() => loadConversation(conv.messages, conv.id)}>Abrir</button>
                    <button onClick={() => deleteConversation(conv.id)}>Deletar</button>
                  </div>
                </div>
              ))}
          </div>
            


      </div>
      <div ref={chatBodyRef} className="chat-body">
        <div className="message bot-message">
          <ChatbotIcon />
          <p className="message-text">
            Olá! 😊 Em que <br />  posso ajudar hoje?
          </p>
        </div>

        {chatHistory.map((chat, index) => (
          <ChatMessage key={index} chat={chat} />
        ))}

      </div>

      {showScrollButton &&(
        <button className="scroll-button" onClick={scrollToButton}>
          <i class="bi bi-arrow-down"></i>
        </button>
      )}

      <div className="chat-footer">
        <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
      </div>
    </div>
   </div>
  );
}

export default App

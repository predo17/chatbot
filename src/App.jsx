import ChatbotIcon from "./components/chatboticon"
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { useEffect, useRef, useState } from "react";


const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef();
  const [isUserScrooling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasUserScrolledManually, setHasUserScrolledManually] = useState(false);
  const [scrollLock, setScrollLock] = useState(false);

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

    const interval = setInterval(() => {
      if (index <= fullText.length) {
        const currentText = fullText.slice(0, index);
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "model", text: currentText };
          return updated;
        });
        index++;
      } else {
        clearInterval(interval);
        setScrollLock(false);
      }
    }, typingSpeed);
  };

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
    }, 1000);

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
          <h2 className="logo-chat">Lunara bot</h2>
        </div>
          
            <div className="chat-climate" onClick={() => setDarkMode(!darkMode)}>
              <span>
                <i className={darkMode ? " bi bi-brightness-high-fill" : "bi bi-moon"}></i>
              </span>
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

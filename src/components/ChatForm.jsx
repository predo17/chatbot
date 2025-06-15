import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) =>{

    const inputRef = useRef();

    const handleFormSubmint = (e) => {
  e.preventDefault();
  const userMessage = inputRef.current.value.trim();
  if (!userMessage) return;
  inputRef.current.value = "";

  const newHistory = [
      ...chatHistory,
      { role: "user", text: userMessage }
  ];

  setChatHistory(newHistory);
  generateBotResponse(newHistory, userMessage);
};

    return(
        <form action="#" className="chat-form" onSubmit={handleFormSubmint}>
          <input ref={inputRef} type="text" placeholder="mensagem..."
          className="message-input" required />
          <button className="bi bi-send-fill">
          </button>
        </form>
    );
}

export default ChatForm
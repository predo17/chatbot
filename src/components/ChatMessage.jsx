import ChatbotIcon from "./chatboticon"

const ChatMessage = ({ chat }) => {
    return(
         <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
            {chat.role === "model" && <ChatbotIcon />}
            <p className="message-text"> {chat.text === "Por favor aguarde..." ?(
                <>
                    {chat.text} <span className="loader"></span>
                </>
            ) : (
                chat.text
            )}
            </p>
        </div>
    );
};

export default ChatMessage
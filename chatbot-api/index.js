import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

let chatMessages = [];

app.get("/api/chat", (req, res) => {
  res.json(chatMessages);
});

app.post("/api/chat", (req, res) => {
  const { role, text } = req.body;
  chatMessages.push({ role, text });
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

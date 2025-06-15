const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const filePath = "./data.json";

// GET: 
router.get("/", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao ler arquivo" });
    const conversations = JSON.parse(data || "[]");
    res.json(conversations);
  });
});

// POST: 
router.post("/", (req, res) => {
  const { title, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Mensagens inválidas" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    const conversations = !err && data ? JSON.parse(data) : [];

    const newConversation = {
      id: uuidv4(),
      title,
      messages,
    };

    conversations.push(newConversation);

    fs.writeFile(filePath, JSON.stringify(conversations, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Erro ao salvar" });

      // Só retorna o id (mais leve e útil pro frontend)
      res.status(201).json({ id: newConversation.id });
    });
  });
});

module.exports = router; 

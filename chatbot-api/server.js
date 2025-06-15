const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

app.listen(4000, () => {
  console.log("Servidor rodando");
});

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  text: { type: String, required: true }
});

const ConversationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  messages: [MessageSchema],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", ConversationSchema);

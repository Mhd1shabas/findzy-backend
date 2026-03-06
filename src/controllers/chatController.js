const Chat = require("../models/chat");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// load or create a chat between current user and a provider
exports.getChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const providerId = req.params.id;

    let chat = await Chat.findOne({ provider: providerId, user: userId });
    if (!chat) {
      chat = new Chat({ provider: providerId, user: userId, messages: [] });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

// add a message to the conversation
exports.postMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const providerId = req.params.id;
    const { text } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let chat = await Chat.findOne({ provider: providerId, user: userId });
    if (!chat) {
      chat = new Chat({ provider: providerId, user: userId, messages: [] });
    }

    const sender = req.user.role === "provider" ? "provider" : "user";
    chat.messages.push({ sender, text: text || '', image });
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
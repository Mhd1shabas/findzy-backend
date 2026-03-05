const Chat = require("../models/chat");

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

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let chat = await Chat.findOne({ provider: providerId, user: userId });
    if (!chat) {
      chat = new Chat({ provider: providerId, user: userId, messages: [] });
    }

    const sender = req.user.role === "provider" ? "provider" : "user";
    chat.messages.push({ sender, text });
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
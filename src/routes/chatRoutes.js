const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const auth = require("../middleware/auth");

// Get chat (or create)
router.get("/:providerId", auth, async (req, res) => {
  const userId = req.user.id;
  const { providerId } = req.params;

  let chat = await Chat.findOne({ user: userId, provider: providerId });

  if (!chat) {
    chat = await Chat.create({
      user: userId,
      provider: providerId,
      messages: [],
    });
  }

  res.json(chat);
});

// Send message
router.post("/:providerId", auth, async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;
  const { providerId } = req.params;

  const chat = await Chat.findOne({ user: userId, provider: providerId });

  chat.messages.push({
    sender: "user",
    text,
  });

  await chat.save();
  res.json(chat);
});

module.exports = router;

import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const newMessage = new Message({
      conversationId: req.body.conversationId,
      sender: req.user._id,
      text: req.body.text,
    });

    const savedMessage = await newMessage.save();

    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};
import ChatMessage from '../models/ChatMessage.js';

export const sendMessage = async (req, res) => {
  try {
    const { message, recipientId } = req.body;
    const senderId = req.user._id;

    const chatMessage = new ChatMessage({
      sender: senderId,
      recipient: recipientId,
      message,
      isAdmin: req.user.role === 'admin'
    });

    await chatMessage.save();

    // Populate sender details before sending response
    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;
    
    // If user is admin, get all messages
    // If user is not admin, only get messages where they are either sender or recipient
    const messages = await ChatMessage.find(
      isAdmin ? {} : {
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      }
    )
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 }) // Sort by ascending order (oldest first)
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can clear messages' });
    }

    // Delete messages between admin and the specified user
    await ChatMessage.deleteMany({
      $or: [
        // Messages from user to admin
        { sender: userId, isAdmin: false },
        // Messages from admin to user
        { sender: req.user._id, recipient: userId },
        // Admin's own messages in the conversation
        { sender: req.user._id, isAdmin: true }
      ]
    });

    res.status(200).json({ message: 'Messages cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
const { getChatResponse } = require('../services/ai.service');
const FridgeItem = require('../models/FridgeItem');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required.' });

    const fridgeItems = await FridgeItem.find({
      userId: req.user._id,
      status: 'active',
    }).sort({ 'batches.expireDate': 1 });

    const reply = await getChatResponse(message, fridgeItems);

    res.json({ success: true, data: { reply } });
  } catch (err) {
    console.log('AI error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
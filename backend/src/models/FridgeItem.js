const mongoose = require('mongoose');

const itemEntrySchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['gram', 'ml', 'pcs'], required: true },
  expireDate: { type: Date, required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const fridgeItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  normalizedName: { type: String, required: true, lowercase: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['produce', 'protein', 'dairy', 'frozen', 'beverage', 'other'],
  },
  unit: { type: String, enum: ['gram', 'ml', 'pcs'], required: true },
  totalQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'empty', 'expired'], default: 'active' },
  description: {
    calories: { type: Number, default: null },
    protein:  { type: Number, default: null },
    fat:      { type: Number, default: null },
    carbs:    { type: Number, default: null },
    fiber:    { type: Number, default: null },
  },
  barcodeId: { type: String, default: null },

  // BUCKET PATTERN — tiap batch masuk nyimpen history-nya
  batches: [itemEntrySchema],

}, { timestamps: true });

module.exports = mongoose.model('FridgeItem', fridgeItemSchema);
const FridgeItem = require('../models/FridgeItem');
const { findSimilarItem } = require('../services/fuzzy.service');

const normalizeName = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');
const toDisplayName = (name) => name.trim().split(' ')
  .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

// GET /api/fridge
exports.getItems = async (req, res) => {
  try {
    const { category, status = 'active' } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const items = await FridgeItem.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, data: { total: items.length, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/fridge/must-use
exports.getMustUse = async (req, res) => {
  try {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const items = await FridgeItem.find({
      userId: req.user._id,
      status: 'active',
      'batches.expireDate': { $lte: threeDaysLater },
    }).sort({ 'batches.expireDate': 1 });

    res.json({ success: true, data: { total: items.length, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/fridge/:id
exports.getItemById = async (req, res) => {
  try {
    const item = await FridgeItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/fridge
exports.createItem = async (req, res) => {
  try {
    const { displayName, category, quantity, unit, expireDate, description, barcodeId } = req.body;

    const normalizedName = normalizeName(displayName);

    // pakai fuzzy, bukan exact match
    const userItems = await FridgeItem.find({
      userId: req.user._id,
      status: { $in: ['active', 'empty'] },
    });

    const fuzzyResult = findSimilarItem(normalizedName, userItems);

    if (fuzzyResult.match && fuzzyResult.similarity >= 80) {
      // RESTOCK ke item yang mirip
      const existing = await FridgeItem.findById(fuzzyResult.item._id);
      existing.batches.push({ quantity, unit, expireDate, addedAt: new Date() });
      existing.totalQuantity += quantity;
      existing.status = 'active';
      await existing.save();

      return res.status(200).json({
        success: true,
        message: `Stok ${existing.displayName} ditambahkan. (${fuzzyResult.similarity}% match)`,
        data: existing,
      });
    }

    // CREATE baru
    const item = await FridgeItem.create({
      userId: req.user._id,
      normalizedName,
      displayName: toDisplayName(displayName),
      category,
      unit,
      totalQuantity: quantity,
      description: description || {},
      barcodeId: barcodeId || null,
      batches: [{ quantity, unit, expireDate, addedAt: new Date() }],
    });

    res.status(201).json({ success: true, message: 'Item added.', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/fridge/:id/use — kurangi stok FIFO
exports.useItem = async (req, res) => {
  try {
    const { usedQty } = req.body;
    if (!usedQty || usedQty <= 0)
      return res.status(400).json({ success: false, message: 'usedQty must be positive.' });

    const item = await FridgeItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (usedQty > item.totalQuantity)
      return res.status(400).json({ success: false, message: `Stok tidak cukup. Tersisa ${item.totalQuantity}${item.unit}.` });

    // FIFO — kurangi dari batch paling lama/expired duluan
    item.batches.sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));

    let remaining = usedQty;
    for (let i = 0; i < item.batches.length; i++) {
      if (remaining <= 0) break;
      if (item.batches[i].quantity <= remaining) {
        remaining -= item.batches[i].quantity;
        item.batches[i].quantity = 0;
      } else {
        item.batches[i].quantity -= remaining;
        remaining = 0;
      }
    }

    // hapus batch yang sudah habis
    item.batches = item.batches.filter(b => b.quantity > 0);
    item.totalQuantity -= usedQty;
    if (item.totalQuantity <= 0) {
      item.totalQuantity = 0;
      item.status = 'empty';
    }

    await item.save();

    res.json({
      success: true,
      message: 'Stok diperbarui.',
      data: {
        _id: item._id,
        displayName: item.displayName,
        totalQuantity: item.totalQuantity,
        unit: item.unit,
        status: item.status,
        batches: item.batches,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/fridge/:id — edit item
exports.updateItem = async (req, res) => {
  try {
    const { displayName, category } = req.body;
    const update = { category };
    if (displayName) {
      update.displayName = toDisplayName(displayName);
      update.normalizedName = normalizeName(displayName);
    }

    const item = await FridgeItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item updated.', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/fridge/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await FridgeItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/fridge/check-duplicate — fuzzy check
exports.checkDuplicate = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required.' });

    const userItems = await FridgeItem.find({
      userId: req.user._id,
      status: { $in: ['active', 'empty'] },
    });

    const result = findSimilarItem(normalizeName(name), userItems);

    res.json({
      success: true,
      data: {
        match: result.match,
        similarity: result.similarity,
        item: result.match ? {
          _id: result.item._id,
          displayName: result.item.displayName,
          totalQuantity: result.item.totalQuantity,
          unit: result.item.unit,
          status: result.item.status,
        } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const { fetchBarcodeData } = require('../services/barcode.service');

// GET /api/barcode/:barcodeId
exports.getBarcode = async (req, res) => {
  try {
    const data = await fetchBarcodeData(req.params.barcodeId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan untuk barcode ini.',
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
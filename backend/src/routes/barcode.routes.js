const express = require('express');
const router = express.Router();
const { getBarcode } = require('../controllers/barcode.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:barcodeId', protect, getBarcode);

module.exports = router;
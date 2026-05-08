const express = require('express');
const router = express.Router();
const f = require('../controllers/fridge.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', f.getItems);
router.get('/must-use', f.getMustUse);
router.post('/check-duplicate', f.checkDuplicate);
router.get('/:id', f.getItemById);
router.post('/', f.createItem);
router.put('/:id', f.updateItem);
router.patch('/:id/use', f.useItem);
router.delete('/:id', f.deleteItem);

module.exports = router;
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Rate limiting podría ser buena idea aquí, pero por ahora simple
router.post('/', contactController.sendContactEmail);

module.exports = router;

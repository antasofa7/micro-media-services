const express = require('express');

const router = express.Router();
const controllers = require('../controllers');

router.get('/', controllers.get);

router.post('/', controllers.post);

router.delete('/:id', controllers.delete);

module.exports = router;

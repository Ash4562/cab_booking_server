
const express = require('express');
const { createContact } = require('../controller/Contactuscontroller');

const router = express.Router();


router.post('/add', createContact);


module.exports = router;

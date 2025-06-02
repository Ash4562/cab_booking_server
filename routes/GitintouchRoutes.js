
const express = require('express');
const { GetinTouch } = require('../controller/Getintouch');


const router = express.Router();


router.post('/add', GetinTouch);


module.exports = router;

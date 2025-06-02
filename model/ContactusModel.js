const mongoose = require('mongoose');

const ContactusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailorcontact: { 
    type: String, 
    required: true, 
  },
  massage: { type: String }
});

module.exports = mongoose.model('Contactus', ContactusSchema);

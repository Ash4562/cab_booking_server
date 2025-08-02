const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://cab-contactus-1.onrender.com",
        "https://drvvy.com"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
// shop
app.use("/cab/contactus", require("./routes/ContantusRoutes"));
app.use("/cab/gitIntouch", require("./routes/GitintouchRoutes"));
// Driver
app.use("/driver/auth", require("./routes/driver/driverAuthRoutes"));
// user
app.use("/user/auth", require("./routes/user/UserController"));
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
// 
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongodb_URL = process.env.MONGODB_URL;

mongoose.connect(mongodb_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected!!!")
    })
    .catch((err) => {
        console.log("Mongoose Error: " + err);
    })
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();
const db = require('./db.js')
const apiRoutes = require('./routes/APIRoutes.js')

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', apiRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Connected to PORT : " + PORT)
})
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcrypt');

require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Server working');
});


async function createDefaultUser() {

    const existingUser =
        await User.findOne({
            username: '123'
        });

    if (existingUser) {
        console.log('Default user exists');
        return;
    }

    const hashedPassword =
        await bcrypt.hash('123', 10);

    const user = new User({
        username: '123',
        password: hashedPassword
    });

    await user.save();

    console.log('Default user created');
}


mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    console.log('MongoDB connected');

    await createDefaultUser();

    app.listen(3000, () => {
        console.log('Server started');
    });

})
.catch(err => {
    console.log(err);
});
const mongoose = require('mongoose');

async function connectMongoDB(url)
{
    return mongoose.connect(url);
}

module.exports = {connectMongoDB};

// mongoose.connect(URL).then((e) => console.log("Mongo Connected"));
const express = require('express');
require('dotenv').config();
const path = require('path');
const userRoute = require('./routers/user');
const { connectMongoDB } = require('./connection');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const blogRoute = require('./routers/blog');
const Blog = require('./models/blog');

const app = express();
const PORT = process.env.PORT || 8000;

connectMongoDB(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch(() => console.log("Error Connecting to MongoDB"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use('/user', userRoute);

app.use('/blog', blogRoute);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

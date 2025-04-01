const { createHmac } = require('node:crypto');
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        salt: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        profileImageURL: {
            type: String,
            default: "/images/avatar.png"
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: "USER",
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = "IronMan";
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {

    const user = await this.findOne({ email });
    if (!user) throw new Error('Email ID Not Found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const UserProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if (hashedPassword !== UserProvidedHash) throw new Error('Incorrect Password');

    const token = createTokenForUser(user);
    return token;
});

// variable name  model-name
const User = model('user', userSchema);

module.exports = User;


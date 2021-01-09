const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String
});

module.exports = mongoose.model("users",UserSchema);
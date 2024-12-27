import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullname: {
            type: String,
            required: true
        },
        avatar: {
            type: String
        },
        coverimage: {
            type: String
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        watchHistory: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Video',
                },
            ],
            default: [],
        }
    },
    {
        timestamps: true
    }
)

UserSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10),
        next()
});

UserSchema.methods.CheckPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.GenerateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.GenerateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const UserModel = mongoose.model('User', UserSchema)

export default UserModel
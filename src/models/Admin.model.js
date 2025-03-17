import mongoose from "mongoose";

const AdminSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

export const AdminModel = mongoose.model('admin', AdminSchema)
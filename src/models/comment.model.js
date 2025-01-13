import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    UserID: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    VideoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Video'
    },
    comment: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

const Commnet = mongoose.model('Commnet', CommentSchema)

export default Commnet
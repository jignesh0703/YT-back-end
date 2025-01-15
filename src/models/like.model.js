import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    Videos : {
        type : mongoose.Types.ObjectId,
        ref : "video"
    },
    Commnets : {
        type : mongoose.Types.ObjectId,
        ref : "Commnet"
    },
    LikedBy : {
        type : mongoose.Types.ObjectId,
        ref : 'User'
    },

})

const Like = mongoose.model('Like',LikeSchema)

export default Like
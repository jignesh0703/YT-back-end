import mongoose from "mongoose";

const PlaySchema = new mongoose.Schema({
    Playlistname: {
        type: String,
        required: true
    },
    Videos: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Video'
        }
    ],
    owner : {
        type : mongoose.Types.ObjectId,
        ref: 'User'
    }
})

const PlayList = mongoose.model('Playlist', PlaySchema)

export default PlayList
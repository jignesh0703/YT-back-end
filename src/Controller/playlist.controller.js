import mongoose from "mongoose";
import PlayList from "../models/playlist.model.js";

const MakePlayList = async (req, res) => {
    try {
        const { playlist } = req.body

        if (!playlist || typeof playlist !== "string") {
            return res.status(400).json({ message: "Playlist name is required and must be a string" });
        }

        const UserId = req.user._id

        const NewPlaylist = new PlayList({
            Playlistname: playlist,
            owner: UserId
        })

        await NewPlaylist.save()

        return res.status(500).json({ message: "PlayList added", NewPlaylist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const AddVideoInPlayList = async (req, res) => {
    try {
        let PlayListID = req.params.playlistid
        PlayListID = PlayListID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        let VideoID = req.params.videoid
        VideoID = VideoID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(VideoID)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const playlist = await PlayList.findById({
            _id: PlayListID
        })

        if (!playlist) {
            return res.status(400).json({ message: "Playlist not foumd" });
        }

        //check if video already exist
        if (playlist.Videos.includes(VideoID)) {
            return res.status(400).json({ message: "Video already exists in the playlist" });
        }

        playlist.Videos.push(VideoID);
        await playlist.save()

        return res.status(200).json({ message: "Video added to the playlist", playlist });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const RemoveVideoInPlayList = async (req, res) => {
    try {
        let PlayListID = req.params.playlistid
        PlayListID = PlayListID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        let VideoID = req.params.videoid
        VideoID = VideoID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(VideoID)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const playlist = await PlayList.findById({
            _id: PlayListID
        })

        if (!playlist) {
            return res.status(400).json({ message: "Playlist not foumd" });
        }

        //check if video already exist
        if (!playlist.Videos.includes(VideoID)) {
            return res.status(400).json({ message: "Video not exists in the playlist" });
        }

        // Remove the video from the playlist
        playlist.Videos = playlist.Videos.filter((video) => video.toString() !== VideoID)
        await playlist.save()

        return res.status(200).json({ message: "Video removed from the playlist", playlist });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const DeletePlayList = async (req, res) => {
    try {
        let PlayListID = req.params.playlistid
        PlayListID = PlayListID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        const deletedPlaylist = await PlayList.findByIdAndDelete(PlayListID)

        if (!deletedPlaylist) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        return res.status(200).json({ message: "Playlist removed Successfully", deletedPlaylist });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const GetUserPlayList = async (req, res) => {
    try {
        const UserId = req.user._id;
        
        const FindUserPlayList = await PlayList.find({
            owner: UserId
        });

        if (!FindUserPlayList || FindUserPlayList.length === 0) {
            return res.status(404).json({ message: "No playlists found for this user" });
        }

        return res
            .status(200)
            .json({
                message: "User Playlist fetched Successfully",
                playlist: FindUserPlayList
            });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const GetPlayListVideos = async (req,res) => {
    try {
        const UserId = req.user._id
        const PlayListID = req.params.playlistid.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        const playlist = await PlayList.findOne({
            _id : PlayListID,
            owner : UserId
        })

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or access denied" });
        }

        return res.status(200).json({
            message: "Playlist videos fetched successfully",
            Playlistname : playlist.Playlistname,
            videos: playlist.Videos,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

export {
    MakePlayList,
    AddVideoInPlayList,
    RemoveVideoInPlayList,
    DeletePlayList,
    GetUserPlayList,
    GetPlayListVideos
}
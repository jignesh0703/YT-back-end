import mongoose from "mongoose";
import PlayList from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

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

        return res.status(200).json({ message: "PlayList added", NewPlaylist })

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const ToggleVideoAddAndRemove = async (req, res) => {
    try {
        let PlayListID = req.params.playlistid;
        PlayListID = PlayListID.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        let VideoID = req.params.videoid;
        VideoID = VideoID.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(VideoID)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const playlist = await PlayList.findById({ _id: PlayListID });

        if (!playlist) {
            return res.status(400).json({ message: "Playlist not found" });
        }

        // Check if video is already in the playlist
        const videoIndex = playlist.Videos.indexOf(VideoID);

        if (videoIndex !== -1) {
            // Remove video if it exists
            playlist.Videos.splice(videoIndex, 1);
            await playlist.save();
            return res.status(200).json({ message: "Video removed from the playlist", playlist });
        } else {
            // Add video if it does not exist
            playlist.Videos.push(VideoID);
            await playlist.save();
            return res.status(200).json({ message: "Video added to the playlist", playlist });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
};

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
        })
        .populate('Videos', 'title thumbnail');

        if (!FindUserPlayList || FindUserPlayList.length === 0) {
            return res.status(204).json({ message: "No playlists found for this user" });
        }

        return res
            .status(200)
            .json({
                message: "User Playlist fetched Successfully",
                playlist: FindUserPlayList
            });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const GetPlayListVideos = async (req, res) => {
    try {
        const UserId = req.user._id
        const PlayListID = req.params.playlistid.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        const playlist = await PlayList.findOne({
            _id: PlayListID,
            owner: UserId
        })
        .populate({
            path: 'Videos', // Populate the 'Videos' field
            select: 'thumbnail title views _id createdAt', // Select video fields
            populate: {
                path: 'owner', // Populate the 'owner' field in each video
                select: 'avatar channel_name' // Select owner fields
            }
        });        

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or access denied" });
        }

        return res.status(200).json({
            message: "Playlist videos fetched successfully",
            videos: playlist,
        });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

const CheckVideoAlredyInPlayList = async (req, res) => {
    try {
        let PlayListID = req.params.playlistid;
        PlayListID = PlayListID.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(PlayListID)) {
            return res.status(400).json({ message: "Invalid Playlist ID" });
        }

        let VideoID = req.params.videoid;
        VideoID = VideoID.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(VideoID)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const CheckPLayListVideo = await PlayList.findOne({
            _id: PlayListID,
            Videos: VideoID
        })

        if (CheckPLayListVideo) {
            return res.status(200).json({
                message: "Video Already Present",
                AlredyAdded: true,
            });
        }

        return res.status(200).json({
            message: "Video not Present",
            AlredyAdded: false,
        });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again." });
    }
}

export {
    MakePlayList,
    ToggleVideoAddAndRemove,
    RemoveVideoInPlayList,
    DeletePlayList,
    GetUserPlayList,
    GetPlayListVideos,
    CheckVideoAlredyInPlayList
}
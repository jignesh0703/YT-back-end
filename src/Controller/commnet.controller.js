import Commnet from "../models/comment.model.js";
import mongoose from "mongoose";
import Like from "../models/like.model.js";

const AddCommnet = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }

        let VideoId = req.params.videoid;
        VideoId = VideoId.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(VideoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const { comment } = req.body

        if (!comment) {
            return res.status(400).json({ message: "Comment are required" });
        }

        const AddNewComment = new Commnet({
            UserID: userId,
            VideoId: VideoId,
            comment
        });

        await AddNewComment.save();

        return res.status(200).json({ message: "Comment added Successfully" })

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const DeleteComment = async (req, res) => {
    try {
        let CommentId = req.params.commentid
        CommentId = CommentId.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(CommentId)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const userId = req.user._id

        const delatecomment = await Commnet.findOneAndDelete({
            _id: CommentId,
            UserID: userId
        })

        if (!delatecomment) {
            return res.status(400).json({ message: "you are not allowed to delete this video" });
        }

        await Like.deleteMany({ Commnets : CommentId })

        return res.status(200).json({ message: "Comment deleted Successfully" })

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const FetchSpecificVideoComment = async (req, res) => {
    try {
        let VideoId = req.params.videoid
        VideoId = VideoId.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(VideoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const fetchComments = await Commnet.find({
            VideoId: VideoId
        })
            .populate('UserID', 'username avatar')
            .sort({ createdAt: -1 })

        if (fetchComments.length === 0) {
            return res.status(204).json({ message: "Video don't have comments" });
        }

        return res.status(200).json({ message: "Comment fetch successfully", fetchComments });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const CountComments = async (req, res) => {
    try {
        let videoid = req.params.videoid
        videoid = videoid.replace(/^:/, '')

        const CommentCount = await Commnet.countDocuments({
            VideoId: videoid
        })

        return res.status(200).json({
            message: CommentCount === 0 ? "No comments found" : "Data count fetched successfully",
            CommentCount
        });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

export {
    AddCommnet,
    DeleteComment,
    FetchSpecificVideoComment,
    CountComments
}
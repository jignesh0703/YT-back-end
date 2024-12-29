import mongoose from "mongoose";
import Like from "../models/like.model.js";

const ToggleVideoLike = async (req, res) => {
    try {
        let Videoid = req.params.videoid
        Videoid = Videoid.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(Videoid)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const UserId = req.user._id

        if (!UserId) {
            return res.status(400).json({ message: "Login is required" });
        }

        const existindLike = await Like.findOne({
            Videos: Videoid,
            LikedBy: UserId
        })

        if (existindLike) {
            await Like.findByIdAndDelete(existindLike._id)
            return res.status(200).json({ message: "like removed" });
        } else {
            const NewLike = new Like({
                Videos: Videoid,
                LikedBy: UserId
            })
            await NewLike.save()
            return res.status(200).json({ message: "like added", NewLike });
        }

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const ToggleCommentLike = async (req, res) => {
    try {
        let Commentid = req.params.commentid
        Commentid = Commentid.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(Commentid)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const UserId = req.user._id

        if (!UserId) {
            return res.status(400).json({ message: "Login is required" });
        }

        const existindLike = await Like.findOne({
            Commnets: Commentid,
            LikedBy: UserId
        })

        if (existindLike) {
            await Like.findByIdAndDelete(existindLike._id)
            return res.status(200).json({ message: "like removed" });
        } else {
            const NewComment = new Like({
                Commnets: Commentid,
                LikedBy: UserId
            })
            await NewComment.save()
            return res.status(200).json({ message: "like added", NewComment });
        }

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const GetVideoLikeCount = async (req,res) => {
    try {
        let Videoid = req.params.videoid;
        Videoid = Videoid.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(Videoid)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const LikeCount = await Like.countDocuments({ Videos : Videoid })

        if(!LikeCount){
            return res.status(400).json({ message: "like Not Found" });
        }

        return res.status(200).json({
            message: "Video like count fetched successfully",
            LikeCount
        });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const GetCommentLikeCount = async (req,res) => {
    try {
        let CommentID = req.params.commentid
        CommentID = CommentID.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(CommentID)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const CommentLikeCount = await Like.countDocuments({
            Commnets : CommentID
        })

        if(!CommentLikeCount){
            return res.status(400).json({ message: "Comment Not Found" });
        }

        return res.status(200).json({
            message: "Comment like count fetched successfully",
            CommentLikeCount
        });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

export {
    ToggleVideoLike,
    ToggleCommentLike,
    GetVideoLikeCount,
    GetCommentLikeCount
}
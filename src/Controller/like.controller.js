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

        return res.status(200).json({
            message: "Video like count fetched successfully",
            LikeCount: LikeCount || 0,
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

        return res.status(200).json({
            message: CommentLikeCount === 0 ? "No comments like found" : "Comment like count fetched successfully",
            CommentLikeCount
        });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const CheckUserLiked = async (req,res) => {
    try {
        const user = req.user._id
        let videoid = req.params.videoid
        videoid = videoid.replace(/^:/, '')

        if (!mongoose.Types.ObjectId.isValid(videoid)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const CheckLike = await Like.findOne({
            Videos : videoid,
            LikedBy : user
        })

        if(!CheckLike){
            return res.status(200).json({ IsLiked : false });
        }

        return res.status(200).json({ IsLiked : true });

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

const CheckUserCommentLiked = async (req,res) => {
    try {
        const user = req.user._id
        let commentid = req.params.commentid
        commentid = commentid.replace(/^:/, '')

        if (!mongoose.Types.ObjectId.isValid(commentid)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        const CheckLike = await Like.findOne({
            Commnets : commentid,
            LikedBy : user
        })

        if(!CheckLike){
            return res.status(200).json({ IsLiked : false });
        }

        return res.status(200).json({ IsLiked : true });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Somthing wrong try agian" })
    }
}

export {
    ToggleVideoLike,
    ToggleCommentLike,
    GetVideoLikeCount,
    GetCommentLikeCount,
    CheckUserLiked,
    CheckUserCommentLiked
}
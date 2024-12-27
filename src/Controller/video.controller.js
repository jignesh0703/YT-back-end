import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import UploadOnCloudinary from "../utils/cloudnary.js";
import { v2 as cloudinary } from 'cloudinary';

const UploadVideo = async (req, res) => {
    try {
        const { title, desciption } = req.body;

        if (
            [title, desciption].some((field) => field?.trim() === "")
        ) {
            return res.status(400).json({ message: "title and desciption are Required!" })
        }

        const { videolink, thumbnail } = req.files;

        if (!videolink?.[0]?.path) {
            return res.status(400).json({ message: "video is Required!" })
        }

        if (!thumbnail?.[0]?.path) {
            return res.status(400).json({ message: "thumbnail is Required!" })
        }

        const allowedVideoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];
        if (!allowedVideoMimeTypes.includes(videolink[0].mimetype)) {
            return res.status(400).json({ message: "Uploaded file is not a valid video format!" });
        }

        const uploadVideo = await UploadOnCloudinary(videolink[0].path)
        const uploadthumbnail = await UploadOnCloudinary(thumbnail[0].path)

        if (!uploadthumbnail) {
            return res.status(500).json({ message: 'Failed to upload thumbnail to Cloudinary.' });
        }

        if (!uploadVideo) {
            return res.status(500).json({ message: 'Failed to upload video to Cloudinary.' });
        }

        const videoURL = uploadVideo.secure_url;
        const thumbnailURL = uploadthumbnail.secure_url;

        const owner = req.user?._id

        if (!owner) {
            return res.status(400).json({ message: "User is not authenticated." });
        }

        const newVideo = new Video({
            title,
            desciption,
            views: 0,
            isPublished: true,
            videolink: videoURL,
            thumbnail: thumbnailURL,
            owner
        })

        await newVideo.save()

        return res
            .status(201)
            .json({ message: "Video uploaded successfully", newVideo })
    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json({ message: "Somthing wrong while uploading video" })
    }

}

const DeleteVideo = async (req, res) => {
    try {
        let videoId = req.params.id
        const userId = req.user?._id

        videoId = videoId.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: "Invalid video ID." });
        }

        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Video is not found" });
        }

        if (video.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not allowed to delete video" });
        }

        if (video.videolink) {
            const VideoURL = video.videolink;
            const publicId = VideoURL.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
        }

        if (video.thumbnail) {
            const thumbnailURL = video.thumbnail;
            const publicId = thumbnailURL.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId)
        }

        await Video.findByIdAndDelete(videoId)

        return res.status(201).json({ message: "Video deleted successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Somthing wrong try again" })
    }
}

const GetAllVideos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const filter = { isPublished: true };

        const videos = await Video.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        // Get the total count of documents matching the filter
        const totalVideos = await Video.countDocuments(filter);

        return res.status(200).json({
            message: "Videos retrieved successfully",
            data: videos,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalVideos / limitNum),
                totalVideos,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong while fetching videos." });
    }
};

const GetVideoById = async (req, res) => {
    try {
        let videoId = req.params.id;

        videoId = videoId.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(404).json({ message: "Invalid video ID" })
        }

        const Getvideo = await Video.findById(videoId)

        if (!Video) {
            return res.status(404).json({ message: "Video is not found" })
        }

        return res.status(200).json({ Getvideo })
    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong while fetch video" })
    }
}

const UpdateVideo = async (req, res) => {
    try {
        let videoId = req.params.id;
        const userId = req.user._id
        const { title, desciption } = req.body;
        const thumbnail = req.file;

        videoId = videoId.replace(/^:/, "");

        const video = await Video.findById(videoId)

        if (video.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not allowed to delete video" });
        }

        video.title = title || video.title
        video.desciption = desciption || video.desciption

        if (video.thumbnail) {
            const thumbnailURL = video.thumbnail;
            const publicId = thumbnailURL.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId)
        }

        if (thumbnail && thumbnail.path) {
            if (!thumbnail.path) {
                return res.status(403).json({ message: "thubmnail is required" });
            }

            const UploadInCloudnary = await UploadOnCloudinary(thumbnail.path)

            if (!UploadInCloudnary) {
                return res.status(403).json({ message: "Fail to upload thubmnail on Cloudinary" });
            }

            video.thumbnail = UploadInCloudnary.secure_url;
        }

        await video.save()
        return res.status(200).json({ message: "Detail update successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Somthing wrong while update video detail" })
    }
}

const ToggleVideoPublic = async (req, res) => {
    try {
        let videoId = req.params.id
        const userId = req.user._id

        videoId = videoId.replace(/^:/, "")

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const video = await Video.findById(videoId)

        if (!video) {
            return res.status(404).json({ message: "video is not found" })
        }

        if (video.owner.toString() !== userId.toString()) {
            return res.status(500).json({ message: "you are not allowed to change anything in this video" })
        }

        video.isPublished = !video.isPublished

        await video.save()

        return res.status(200).json({message:`Video ${video.isPublished ? "published" : "unpublished"} successfully`})

    } catch (error) {
        return res.status(500).json({ message: "Somthing wrong try again" })
    }
}

export { UploadVideo, DeleteVideo, GetAllVideos, GetVideoById, UpdateVideo, ToggleVideoPublic }
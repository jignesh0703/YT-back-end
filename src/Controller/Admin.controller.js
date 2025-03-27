import jwt from 'jsonwebtoken'
import { AdminModel } from '../models/Admin.model.js'
import { Video } from "../models/video.model.js";
import { v2 as cloudinary } from 'cloudinary';

const Login = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'All feilds are required' })
        }

        if (!email.trim() || !password.trim()) {
            return res.status(400).json({ message: 'All feilds are required' })
        }

        const FindEmail = await AdminModel.findOne({ email })
        if (!FindEmail) {
            return res.status(400).json({ message: 'Incorrect Email ID' })
        }

        if (password.toString() !== FindEmail.password.toString()) {
            return res.status(400).json({ message: 'Incorrect password try another' })
        }

        const token = await jwt.sign(
            {
                _id: FindEmail._id
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '1d'
            }
        )

        const option = {
            httponly: true,
            secure: true,
            sameSite: 'None'
        }

        res.cookie('token', token, option)
        return res.status(200).json({ message: 'Login Succesfully!', FindEmail })

    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Somthing wrong try again' })
    }
}

const Check = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Website is Logined', isLogin: true })
    } catch (error) {
        return res.status(400).json({ message: 'Somthing wrong try again' })
    }
}

const FetchAllVideos = async (req, res) => {
    try {
        const FindVideos = await Video.find({})
            .sort({ createdAt: -1 })
            .select('-isPublished -updatedAt')
            .populate('owner', 'avatar channel_name')

        return res.status(200).json({ message: 'All videos fetch succesfully!', FindVideos })

    } catch (error) {
        return res.status(400).json({ message: 'Somthing wrong try again' })
    }
}

const FetchIndivisualVideo = async (req, res) => {
    try {
        const videoId = req.params.id

        const FindVideo = await Video.findById(videoId).select('-isPublished -updatedAt -createdAt')
        if (!FindVideo) {
            return res.status(400).json({ message: 'Video dont found' })
        }

        return res.status(200).json({ message: 'video fetch succesfully!', FindVideo })

    } catch (error) {
        return res.status(400).json({ message: 'Somthing wrong try again' })
    }
}

const DeleteVideo = async (req, res) => {
    try {
        const videoId = req.params.id

        const FindVideo = await Video.findById(videoId)
        if (!FindVideo) {
            return res.status(400).json({ message: "Video don't found" })
        }

        if (FindVideo.thumbnail) {
            const Thumbnail = FindVideo.thumbnail
            const publicId = Thumbnail.split('/').slice(-1)[0].split('.')[0]
            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(Thumbnail);

            if (isImage) {
                await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            } else {
                await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
            }
        }

        if (FindVideo.videolink) {
            const VideoURL = FindVideo.videolink;
            const publicId = VideoURL.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
        }

        await Video.findByIdAndDelete(videoId)

        return res.status(200).json({ message: 'video delete succesfully!' })

    } catch (error) {
        return res.status(400).json({ message: 'Somthing wrong try again' })
    }
}

const SearchHandler = async (req, res) => {
    try {
        let { search } = req.body
        if (!search) {
            return res.status(400).json({ message: 'Search text is required!' })
        }

        search = search.trim()

        const FindVideo = await Video.find({ title: { $regex: search, $options: 'i' } })
            .select('-isPublished -updatedAt')
            .populate('owner', 'avatar channel_name')

        if (FindVideo.length === 0) {
            return res.status(404).json({ message: "No matching videos found." })
        }

        return res.status(200).json({ message: 'Video(s) found successfully.', FindVideo })

    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong. Please try again.' })
    }
}

export {
    Login,
    Check,
    FetchAllVideos,
    FetchIndivisualVideo,
    DeleteVideo,
    SearchHandler
}
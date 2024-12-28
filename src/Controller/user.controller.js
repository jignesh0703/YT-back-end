import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import UploadOnCloudinary from "../utils/cloudnary.js";
import { v2 as cloudinary } from 'cloudinary';

const GenerateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await UserModel.findById(userid)
        const accesstoken = await user.GenerateAccessToken()
        const refreshtoken = await user.GenerateRefreshToken()

        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }

    } catch (error) {
        console.log(error)
        throw new Error("Somthing wrong try again");
    }
}

const Registration = async (req, res) => {
    try {
        const { username, email, fullname, password } = req.body

        if (
            [username, email, fullname, password].some((field) => field?.trim() === "")
        ) {
            return res.status(400).json({ message: "All fields are Required!" })
        }

        const checknames = await UserModel.findOne({
            $or: [{ email }, { username }]
        })

        if (checknames) {
            return res.status(400).json({ message: "Email or username is already used ,try another one" })
        }

        const { avatar, coverimage } = req.files;

        if (!avatar?.[0]?.path || !coverimage?.[0]?.path) {
            return res.status(400).json({ message: "Both avatar and cover image are required" });
        }

        const avatarUploadOnCloudinary = await UploadOnCloudinary(avatar[0].path)
        const coverimageUploadOnCloudinary = await UploadOnCloudinary(coverimage[0].path)

        if (!avatarUploadOnCloudinary || !coverimageUploadOnCloudinary) {
            return res.status(500).json({ message: 'Failed to upload images to Cloudinary.' });
        }

        const avatarURL = avatarUploadOnCloudinary.secure_url;
        const coverImageURL = coverimageUploadOnCloudinary.secure_url;

        const newUser = new UserModel({
            username,
            email,
            fullname,
            avatar: avatarURL || "",
            coverimage: coverImageURL || "",
            password,
        })

        await newUser.save();

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                username,
                email,
                avatar: avatarURL,
                coverImage: coverImageURL,
            },
        });

    } catch (error) {
        if (req.files?.avatar?.[0]?.path) {
            await cloudinary.uploader.destroy(req.files.avatar[0].public_id);
        }
        if (req.files?.coverimage?.[0]?.path) {
            await cloudinary.uploader.destroy(req.files.coverimage[0].public_id);
        }
        return res.status(400).json({ message: 'Dont Registering user try again' })
    }
}

const login = async (req, res) => {
    try {
        const { email, username, password } = req.body

        if (!email && !username) {
            return res.status(400).json({ message: "email or username is required" })
        }

        const user = await UserModel.findOne({
            $or: [{ email }, { username }]
        })

        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const isPasswordValid = await user.CheckPassword(password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: "invalid password" })
        }

        const { accesstoken, refreshtoken } = await GenerateAccessAndRefreshToken(user._id)

        const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        }

        res.cookie('accesstoken', accesstoken, options)
        res.cookie('refreshToken', refreshtoken, options)

        return res.status(200).json({
            message: "User logged in successfully",
            loggedInUser,
            accesstoken,
            refreshtoken
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Unable to login the user at this time. Please try again later" });
    }
}

const logout = async (req, res) => {
    try {
        await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        }

        return res
            .status(200)
            .clearCookie('accesstoken', options)
            .clearCookie('refreshToken', options)
            .json({ message: "Logout Successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Unable to logout. Please try again later" });
    }
}

const Fetchuserdetail = async (req, res) => {
    try {
        return res.status(200)
            .json({ message: "Data fetch successfully", user: req.user })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch user details" });
    }
}

const UpdatePassword = async (req, res) => {
    try {
        const { oldpassword, newpassword, confirmpassword } = req.body

        if (newpassword !== confirmpassword) {
            return res.status(400).json({ message: "password and confirm password is not same" })
        }

        const user = await UserModel.findById(req.user?._id)
        const ispassword = await user.CheckPassword(oldpassword)

        if (!ispassword) {
            return res.status(400).json({ message: "invalid password" })
        }

        user.password = newpassword
        await user.save({ validateBeforeSave: false })

        return res.status(200).json({ message: "Password update Successfully!" })

    } catch (error) {
        return res.status(400).json({ message: "Somthing wrong try again" });
    }
}

const UpdateAccountDetails = async (req, res) => {
    try {
        const { email, fullname, username } = req.body

        if (!email || !fullname || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullname: fullname,
                    email: email,
                    username: username
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken")

        return res.status(200).json({ message: "Account details updated successfully", user })

    } catch (error) {
        return res.status(400).json({ message: "Somthing wrong try again" });
    }
}

const Changeavatar = async (req, res) => {
    try {
        const avatarpath = req.file?.path;

        if (!avatarpath) {
            return res.status(400).json({ message: "Avatar file is missing" });
        }

        const user = await UserModel.findById(req.user._id).select("-password -refreshToken");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.avatar) {
            const avatarURL = user.avatar;
            const publicId = avatarURL.split('/').slice(-1)[0].split('.')[0]; // Remove version and file extension
            await cloudinary.uploader.destroy(publicId);
        }

        const avatar = await UploadOnCloudinary(avatarpath);

        if (!avatar) {
            return res.status(400).json({ message: "Error while uploading avatar" });
        }

        const avatarURL = avatar.secure_url;

        if (!avatarURL) {
            return res.status(400).json({ message: "Error while uploading avatar" });
        }

        user.avatar = avatarURL;
        await user.save();

        return res.status(200).json({ message: "Avatar uploaded successfully", user });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Something went wrong while uploading avatar" });
    }
};

const Changecoverimage = async (req, res) => {
    try {
        const coverpath = req.file?.path;

        if (!coverpath) {
            return res.status(400).json({ message: "Coverimage file is missing" });
        }

        const user = await UserModel.findById(req.user._id).select("-password -refreshToken");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.coverimage) {
            const coverimageURL = user.coverimage;
            console.log(coverimageURL)
            const publicId = coverimageURL.split('/').slice(-1)[0].split('.')[0]; // Remove version and file extension
            console.log(publicId)

            const destroyResponse = await cloudinary.uploader.destroy(publicId);
            console.log('Cloudinary destroy response:', destroyResponse);

            if (destroyResponse.result !== 'ok') {
                console.error('Error destroying old image:', destroyResponse);
                return res.status(500).json({ message: 'Error while deleting old avatar' });
            }
        }

        const coverimage = await UploadOnCloudinary(coverpath);

        if (!coverimage) {
            return res.status(400).json({ message: "Error while uploading coverimage" });
        }

        const coverimageURL = coverimage.secure_url;

        if (!coverimageURL) {
            return res.status(400).json({ message: "Error while uploading coverimage" });
        }

        user.coverimage = coverimageURL;
        await user.save();

        return res.status(200).json({ message: "Coverimage uploaded successfully", user });

    } catch (error) {
        return res.status(400).json({ message: "Something went wrong while uploading coverimage" });
    }
};

const AddView = async (req, res) => {
    try {
        let VideoId = req.params.videoid
        VideoId = VideoId.replace(/^:/, "")

        const user =  await Video.findByIdAndUpdate(
            VideoId,
            { $inc: { views: 1 } },
            {
                new : true
            }
        )

        if(!user){
            return res.status(400).json({ message: "Video not found "});
        }

        return res.status(200).json({ message: "View added" , user });

    } catch (error) {
        return res.status(400).json({ message: "Something went wrong try again" });
    }
}

const AddtoWatchHistory = async (req, res) => {
    try {
        let videoId = req.params.videoid;

        videoId = videoId.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!Array.isArray(user.watchHistory)) {
            user.watchHistory = [];
        }

        const videoObjectId = new mongoose.Types.ObjectId(videoId);

        if (user.watchHistory.includes(videoObjectId)) {
            user.watchHistory = user.watchHistory.filter(
                (id) => !id.equals(videoObjectId)
            );
        }

        user.watchHistory.unshift({
            _id: videoObjectId,
            watchedAt: new Date(), // Add the current timestamp
        });

        await user.save();

        return res.status(200).json({
            message: "Video added to watch history",
            watchHistory: user.watchHistory,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

const getWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const watchHistory = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) } // Match the user
            },
            {
                $lookup: {
                    from: "videos", // The name of the video collection in MongoDB
                    localField: "watchHistory", // The array field in UserModel
                    foreignField: "_id", // The field in Video collection
                    as: "videoDetails" // The alias for fetched data
                }
            },
            {
                $unwind: "$videoDetails" // Convert videoDetails array to individual objects
            },
            {
                $project: { // Include only the required fields
                    videoId: "$videoDetails._id",
                    videolink: "$videoDetails.videolink",
                    thumbnail: "$videoDetails.thumbnail",
                    title: "$videoDetails.title",
                    description: "$videoDetails.desciption",
                    views: "$videoDetails.views",
                    watchedAt: "$updatedAt"
                }
            },
            {
                $sort: { watchedAt: -1 } // Sort by most recently watched
            }
        ]);

        return res.status(200).json({
            message: "Watch history fetched successfully",
            watchHistory,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


export { Registration, login, logout, Fetchuserdetail, UpdatePassword, UpdateAccountDetails, Changeavatar, Changecoverimage, AddView , AddtoWatchHistory, getWatchHistory }
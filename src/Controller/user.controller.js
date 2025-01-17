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
        throw new Error("Somthing wrong try again");
    }
}

const Registration = async (req, res) => {
    try {
        const { username, email, channel_name, password } = req.body

        if (
            [username, email, channel_name, password].some((field) => field?.trim() === "")
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

        if (!avatar || !coverimage) {
            return res.status(400).json({ message: "Both avatar and cover image are required" });
        }

        const avatarUploadOnCloudinary = await UploadOnCloudinary(avatar[0].buffer, `${Date.now()}-${avatar[0].originalname}`);
        const coverimageUploadOnCloudinary = await UploadOnCloudinary(coverimage[0].buffer, `${Date.now()}-${coverimage[0].originalname}`);

        if (!avatarUploadOnCloudinary || !coverimageUploadOnCloudinary) {
            return res.status(500).json({ message: 'Failed to upload images to Cloudinary.' });
        }

        const avatarURL = avatarUploadOnCloudinary.secure_url;
        const coverImageURL = coverimageUploadOnCloudinary.secure_url;

        const newUser = new UserModel({
            username,
            email,
            channel_name,
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
        const { emailorusername, password } = req.body

        if (!emailorusername) {
            return res.status(400).json({ message: "email or username is required" })
        }

        const user = await UserModel.findOne({
            $or: [{ email: emailorusername }, { username: emailorusername }]
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
            secure: true, // Ensure secure cookies only in production
            sameSite: 'none'
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
            sameSite: 'None'
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
        const { email, channel_name, username } = req.body;

        if (!email || !channel_name || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUserByUsername = await UserModel.findOne({ username });
        if (existingUserByUsername && existingUserByUsername._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail && existingUserByEmail._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    channel_name: channel_name,
                    email: email,
                    username: username
                }
            },
            {
                new: true
            }
        ).select("-password -refreshToken");

        return res.status(200).json({ message: "Account details updated successfully", user });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, try again" });
    }
};

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
            const publicId = coverimageURL.split('/').slice(-1)[0].split('.')[0]; // Remove version and file extension

            const destroyResponse = await cloudinary.uploader.destroy(publicId);

            if (destroyResponse.result !== 'ok') {
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

        const user = await Video.findByIdAndUpdate(
            VideoId,
            { $inc: { views: 1 } },
            {
                new: true
            }
        )

        if (!user) {
            return res.status(400).json({ message: "Video not found " });
        }

        return res.status(200).json({ message: "View added", user });

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

        // Remove existing entry for the video if present
        user.watchHistory = user.watchHistory.filter(
            (entry) => entry._id && !entry._id.equals(videoObjectId)
        );

        user.watchHistory.unshift({
            _id: videoObjectId,
            watchedAt: new Date(),
        });

        await user.save();

        return res.status(200).json({
            message: "Video added to watch history",
            watchHistory: user.watchHistory,
        });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

const getWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const watchHistory = await UserModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: "$watchHistory", // Unwind the watchHistory array
            },
            {
                $lookup: {
                    from: "videos", // The name of the video collection in MongoDB
                    localField: "watchHistory._id", // The array field in UserModel
                    foreignField: "_id", // The field in Video collection
                    as: "videoDetails" // The alias for fetched data
                }
            },
            {
                $unwind: "$videoDetails" // Convert videoDetails array to individual objects
            },
            {
                $lookup: {
                    from: "users", // The name of the users collection in MongoDB
                    localField: "videoDetails.owner", // The owner field in Video collection
                    foreignField: "_id", // The field in User collection
                    as: "userDetails" // The alias for fetched user data
                }
            },
            {
                $unwind: "$userDetails" // Convert userDetails array to individual objects
            },
            {
                $project: {
                    videoId: "$videoDetails._id",
                    videolink: "$videoDetails.videolink",
                    thumbnail: "$videoDetails.thumbnail",
                    title: "$videoDetails.title",
                    description: "$videoDetails.desciption",
                    views: "$videoDetails.views",
                    createdAt: "$videoDetails.createdAt",
                    watchedAt: "$watchHistory.watchedAt",
                    avatar: "$userDetails.avatar", // Get the user's avatar
                    channel_name: "$userDetails.channel_name" // Get the user's channel_name
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
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

const DeleteVideoFromWatchHistory = async (req, res) => {
    try {
        let VideoId = req.params.videoid
        VideoId = VideoId.replace(/^:/, "")

        if (!VideoId) {
            return res.status(400).json({ message: "Video not found" });
        }

        const userId = req.user._id

        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }

        const watchHistoryFind = await UserModel.findByIdAndUpdate(
            userId,
            {
                $pull: { watchHistory: { _id: VideoId } }
            },
            {
                new: true
            }
        )

        if (!watchHistoryFind) {
            return res.status(400).json({ message: "video not found" });
        }

        return res.status(200).json({ message: "Video remove successfully" })

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
}

const ClearWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await UserModel.findByIdAndUpdate(
            userId,
            {
                watchHistory: []
            },
            {
                new: true
            }
        )

        if (!user) {
            return res.status(400).json({ message: "Somthing wrong" });
        }

        return res.status(200).json({ message: "WatchHistory clear Successfully" })

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
}

const getUserChannelProfile = async (req, res) => {
    try {
        let Channelid = req.params.channelid;
        Channelid = Channelid.replace(/^:/, "");

        const Channel = await UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(Channelid)
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribersTo"
                }
            },
            {
                $addFields: {
                    subscribecount: {
                        $size: "$subscribers"
                    },
                    channlesubscribecount: {
                        $size: "$subscribersTo"
                    },
                    issubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, { $map: { input: "$subscribers", as: "sub", in: "$$sub.subscriber" } }]
                            },
                            then: true,
                            else: false
                        }
                    }
                }

            },
            {
                $project: {
                    channel_name: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverimage: 1,
                    email: 1,
                }
            }
        ]);

        if (!Channel?.length) {
            return res.status(400).json({ message: "Channel not found" });
        }

        return res.status(200).json({ message: "User channel fetched successfully", Channel });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

const CheckChannel = async (req, res) => {
    try {
        if (!req.user._id) {
            return res.status(200).json({ user: 'false' });
        }

        const user = req.user._id.toString();
        let id = req.params.userid.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        if (user === id) {
            return res.status(200).json({ user: 'true' });
        } else {
            return res.status(200).json({ user: 'false' });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, please try again" });
    }
};

export {
    Registration,
    login,
    logout,
    Fetchuserdetail,
    UpdatePassword,
    UpdateAccountDetails,
    Changeavatar,
    Changecoverimage,
    AddView,
    AddtoWatchHistory,
    getWatchHistory,
    DeleteVideoFromWatchHistory,
    ClearWatchHistory,
    getUserChannelProfile,
    CheckChannel
}
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import UserModel from "../models/user.model.js";

const toggleSubscription = async (req, res) => {
    try {
        let channelId = req.params.channelId;
        const userId = req.user._id

        channelId = channelId.replace(/^:/, "");

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: "Invalid video ID" });
        }

        if (!channelId) {
            return res.status(400).json({ message: "Channel not found" });
        }

        const existingSubscribe = await Subscription.findOne({
            subscriber: userId,
            channel: channelId
        })

        if (existingSubscribe) {
            await existingSubscribe.deleteOne();
            return res.status(200).json({ message: "Unsubscribed successfully" });
        } else {
            await Subscription.create({
                subscriber: userId,
                channel: channelId
            });
            return res.status(200).json({ message: "Subscribed successfully" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Somthing wrong try again" });
    }
}

const getUserChannel = async (req, res) => {
    try {
        let channelId = req.params.channelId;
        channelId = channelId.replace(/^:/, "");

        // Convert to ObjectId
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: "Invalid Channel ID" });
        }

        const findsubscribedchannel = await UserModel.findOne({ _id: channelId });

        if (!findsubscribedchannel) {
            return res.status(400).json({ message: "Channel not found" });
        }

        const subscriber = await Subscription.find({
            channel: channelId
        })
            .populate("subscriber", "_id")
            .select("subscriber -_id");

        return res.status(200).json({ message: "Subscriber fetch successfully", subscriber });

    } catch (error) {
        return res.status(400).json({ message: "Somthing wrong try again" });

    }
}

export { toggleSubscription, getUserChannel }
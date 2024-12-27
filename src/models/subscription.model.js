import mongoose, { Schema } from "mongoose";

const SubscribeSchema = new Schema({
    subscriber :{
        type : Schema.Types.ObjectId, // one who is subscribing
        ref : "User"
    },
    channel :{
        type : Schema.Types.ObjectId, // one who is subscribing to channel
        ref : "User"
    }
})

SubscribeSchema.index({ subscriber:1 , channel:1 }, { unique : true })

export const Subscription = mongoose.model('Subscription',SubscribeSchema)
import express from 'express'
import { toggleSubscription, getUserChannel, CheckIsSubscribed, FetchChannelSubscbed } from '../Controller/Subscription.controller.js'
import VerifyJWT from '../midelware/JWT.midelware.js'

const SubscriptionRoutes = express.Router()

SubscriptionRoutes.route('/c/:channelId')
    .post(VerifyJWT , toggleSubscription)
    .get(getUserChannel)

SubscriptionRoutes.route('/check/:channelId').get(VerifyJWT , CheckIsSubscribed)
SubscriptionRoutes.route('/getusersubscription').get(VerifyJWT , FetchChannelSubscbed)

export default SubscriptionRoutes
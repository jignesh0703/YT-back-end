import express from 'express'
import { toggleSubscription , getUserChannel } from '../Controller/Subscription.controller.js'
import VerifyJWT from '../midelware/JWT.midelware.js'

const SubscriptionRoutes = express.Router()

SubscriptionRoutes.use(VerifyJWT);

SubscriptionRoutes.route('/c/:channelId')
    .post(toggleSubscription)
    .get(getUserChannel)

export default SubscriptionRoutes
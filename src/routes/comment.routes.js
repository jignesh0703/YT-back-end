import express from 'express'
import { AddCommnet, CountComments, DeleteComment, FetchSpecificVideoComment } from '../Controller/commnet.controller.js'
import VerifyJWT from '../midelware/JWT.midelware.js'

const CommnetRoutes = express.Router()

CommnetRoutes.route('/addcomment/:videoid').post(VerifyJWT , AddCommnet)
CommnetRoutes.route('/delatecomment/:commentid').delete(VerifyJWT , DeleteComment)
CommnetRoutes.route('/getcomment/:videoid').get(FetchSpecificVideoComment)
CommnetRoutes.route('/countcomment/:videoid').get(CountComments)

export default CommnetRoutes
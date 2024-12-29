import express from 'express'
import VerifyJWT from '../midelware/JWT.midelware.js'
import { ToggleCommentLike, ToggleVideoLike } from '../Controller/like.controller.js'

const LikeRouter = express.Router()

LikeRouter.route('/addliketovideo/:videoid').post(VerifyJWT, ToggleVideoLike)
LikeRouter.route('/addliketocomment/:commentid').post(VerifyJWT, ToggleCommentLike)

export default LikeRouter
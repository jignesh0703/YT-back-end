import express from 'express'
import VerifyJWT from '../midelware/JWT.midelware.js'
import { CheckUserCommentLiked, CheckUserLiked, GetCommentLikeCount, GetVideoLikeCount, ToggleCommentLike, ToggleVideoLike } from '../Controller/like.controller.js'

const LikeRouter = express.Router()

LikeRouter.route('/addliketovideo/:videoid').post(VerifyJWT, ToggleVideoLike)
LikeRouter.route('/addliketocomment/:commentid').post(VerifyJWT, ToggleCommentLike)
LikeRouter.route('/getvideolikecount/:videoid').get(GetVideoLikeCount)
LikeRouter.route('/getcommentlikecount/:commentid').get(GetCommentLikeCount)
LikeRouter.route('/checkuserliked/:videoid').get(VerifyJWT, CheckUserLiked)
LikeRouter.route('/checkuserlikedcomments/:commentid').get(VerifyJWT, CheckUserCommentLiked)

export default LikeRouter
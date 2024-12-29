import express from 'express'
import VerifyJWT from '../midelware/JWT.midelware.js'
import { MakePlayList, AddVideoInPlayList, RemoveVideoInPlayList, DeletePlayList, GetUserPlayList, GetPlayListVideos } from '../Controller/playlist.controller.js'

const PlaylistRouter = express.Router()

PlaylistRouter.route('/add').post(VerifyJWT, MakePlayList)
PlaylistRouter.route('/addvideoinplaylist/:playlistid/addvideo/:videoid').post(VerifyJWT, AddVideoInPlayList)
PlaylistRouter.route('/removevideoinplaylist/:playlistid/removevideo/:videoid').delete(VerifyJWT, RemoveVideoInPlayList)
PlaylistRouter.route('/deleteplaylist/:playlistid').delete(VerifyJWT, DeletePlayList)
PlaylistRouter.route('/getuserplaylist').get(VerifyJWT, GetUserPlayList)
PlaylistRouter.route('/getplaylistvideos/:playlistid').get(VerifyJWT, GetPlayListVideos)

export default PlaylistRouter
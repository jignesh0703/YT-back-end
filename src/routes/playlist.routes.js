import express from 'express'
import VerifyJWT from '../midelware/JWT.midelware.js'
import { MakePlayList, ToggleVideoAddAndRemove, RemoveVideoInPlayList, DeletePlayList, GetUserPlayList, GetPlayListVideos, CheckVideoAlredyInPlayList } from '../Controller/playlist.controller.js'

const PlaylistRouter = express.Router()

PlaylistRouter.route('/add').post(VerifyJWT, MakePlayList)
PlaylistRouter.route('/addvideoinplaylist/:playlistid/addvideo/:videoid').post(VerifyJWT, ToggleVideoAddAndRemove)
PlaylistRouter.route('/removevideoinplaylist/:playlistid/removevideo/:videoid').delete(VerifyJWT, RemoveVideoInPlayList)
PlaylistRouter.route('/deleteplaylist/:playlistid').delete(VerifyJWT, DeletePlayList)
PlaylistRouter.route('/getuserplaylist').get(VerifyJWT, GetUserPlayList)
PlaylistRouter.route('/getplaylistvideos/:playlistid').get(VerifyJWT, GetPlayListVideos)
PlaylistRouter.route('/checkvideo/:playlistid/alredypresent/:videoid').get(VerifyJWT, CheckVideoAlredyInPlayList)

export default PlaylistRouter
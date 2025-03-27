import express from 'express'
import { CheckVideoowner, DeleteVideo, GetAllVideos, GetChannelAllVideo, GetIndivisualUserVideo, GetVideoById, ToggleVideoPublic, UpdateVideo, UploadVideo, ChechVideoPublic, SearchHandler } from '../Controller/video.controller.js'
import VerifyJWT from "../midelware/JWT.midelware.js";
import { upload } from "../midelware/multer.midelwar.js";

const VideoRouter = express.Router()

VideoRouter.route('/upload').post(
    upload.fields([
        {
            name: "videolink",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        },
    ]),
    VerifyJWT, UploadVideo)
VideoRouter.route('/delete/:id').delete(VerifyJWT, DeleteVideo)
VideoRouter.route('/getallvideo').get(GetAllVideos)
VideoRouter.route('/getvideo/:id').get(GetVideoById)
VideoRouter.route('/updatevideo/:id').put(upload.single("thumbnail"), VerifyJWT, UpdateVideo)
VideoRouter.route('/checkvideopublic/:id').get(VerifyJWT, ChechVideoPublic)
VideoRouter.route('/togglevideopublic/:id').put(VerifyJWT, ToggleVideoPublic)
VideoRouter.route('/getuservideo').get(VerifyJWT, GetIndivisualUserVideo)
VideoRouter.route('/checkuser/:videoId').get(VerifyJWT, CheckVideoowner)
VideoRouter.route('/getchannelvideos/:channelid').get(GetChannelAllVideo)
VideoRouter.route('/search').post(SearchHandler)

export default VideoRouter
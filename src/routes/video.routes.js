import express from 'express'
import { DeleteVideo, GetAllVideos, GetVideoById, ToggleVideoPublic, UpdateVideo, UploadVideo } from '../Controller/video.controller.js'
import VerifyJWT from "../midelware/JWT.midelware.js";
import { upload } from "../midelware/multer.midelwar.js";

const VideoRouter = express.Router()

VideoRouter.route('/upload').post(
        upload.fields([
            {
                name:"videolink",
                maxCount:1
            },
            {
                name:"thumbnail",
                maxCount:1
            },
        ]),
    VerifyJWT,UploadVideo)
VideoRouter.route('/delete/:id').delete(VerifyJWT,DeleteVideo)
VideoRouter.route('/getallvideo').get(GetAllVideos)
VideoRouter.route('/getvideo/:id').get(GetVideoById)
VideoRouter.route('/updatevideo/:id').put(upload.single("thumbnail"),VerifyJWT,UpdateVideo)
VideoRouter.route('/togglevideopublic/:id').put(VerifyJWT,ToggleVideoPublic)

export default VideoRouter
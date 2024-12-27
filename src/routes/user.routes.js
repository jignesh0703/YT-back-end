import { AddtoWatchHostory, Changeavatar, Changecoverimage, Fetchuserdetail, getWatchHistory, login, logout, Registration, UpdateAccountDetails, UpdatePassword  } from "../Controller/user.controller.js";
import { Router } from 'express'
import { upload } from "../midelware/multer.midelwar.js";
import VerifyJWT from "../midelware/JWT.midelware.js";

const UserRouter = Router()

UserRouter.route('/add').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    Registration
)
UserRouter.route('/login').post(login)
UserRouter.route('/logout').post(VerifyJWT,logout)
UserRouter.route('/getdetail').post(VerifyJWT,Fetchuserdetail)
UserRouter.route('/updatepass').post(VerifyJWT,UpdatePassword)
UserRouter.route('/updatedetail').patch(VerifyJWT,UpdateAccountDetails)
UserRouter.route('/changeavatar').patch(VerifyJWT,upload.single("avatar"),Changeavatar)
UserRouter.route('/changecoverimage').patch(VerifyJWT,upload.single("coverimage"),Changecoverimage)
UserRouter.post('/addtowatchHistory/:videoid',VerifyJWT, AddtoWatchHostory);
UserRouter.get('/fetchwatchHistory',VerifyJWT, getWatchHistory);

export default UserRouter
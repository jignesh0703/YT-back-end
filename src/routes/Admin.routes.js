import express from 'express'
import { DeleteVideo, FetchAllVideos, FetchIndivisualVideo, Login } from '../Controller/Admin.controller.js'

const AdminRouter = express.Router()

AdminRouter.post('/login', Login)
AdminRouter.get('/fetch', FetchAllVideos)
AdminRouter.get('/fetchvideo/:id', FetchIndivisualVideo)
AdminRouter.delete('/delete/:id', DeleteVideo)

export default AdminRouter
import express from 'express'
import { Check, DeleteVideo, FetchAllVideos, FetchIndivisualVideo, Login, SearchHandler } from '../Controller/Admin.controller.js'
import AdminDecord from '../midelware/Admin.middler.js';

const AdminRouter = express.Router()

AdminRouter.post('/login', Login)
AdminRouter.get('/check', AdminDecord, Check)
AdminRouter.get('/fetch', FetchAllVideos)
AdminRouter.get('/fetchvideo/:id', FetchIndivisualVideo)
AdminRouter.delete('/delete/:id', DeleteVideo)
AdminRouter.post('/search', SearchHandler)

export default AdminRouter
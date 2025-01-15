import express from 'express'
import cors from 'cors'
import UserRouter from './routes/user.routes.js'
import VideoRouter from './routes/video.routes.js';
import SubscriptionRoutes from './routes/subscription.routes.js'
import CommnetRoutes from './routes/comment.routes.js'
import LikeRouter from './routes/like.routes.js';
import PlaylistRouter from './routes/playlist.routes.js';
import cookieParser from "cookie-parser";


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Parses application/x-www-form-urlencoded
app.use(cookieParser());

app.use(cors({
    origin : 'https://mern-stack-yt.netlify.app',
    credentials : true
}))

app.use('/api/user',UserRouter)
app.use('/api/video',VideoRouter)
app.use('/api/subscription',SubscriptionRoutes)
app.use('/api/comment',CommnetRoutes)
app.use('/api/like',LikeRouter)
app.use('/api/playlist',PlaylistRouter)

export default app
import express from 'express'
import cors from 'cors'
import UserRouter from './routes/user.routes.js'
import VideoRouter from './routes/video.routes.js';
import SubscriptionRoutes from './routes/subscription.routes.js'
import CommnetRoutes from './routes/comment.routes.js'
import LikeRouter from './routes/like.routes.js';
import PlaylistRouter from './routes/playlist.routes.js';
import cookieParser from "cookie-parser";
import AdminRouter from './routes/Admin.routes.js';

const app = express()

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());

app.use(cors({
    origin : [
        'https://yt-front-end.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}))

app.use('/api/user', UserRouter)
app.use('/api/video', VideoRouter)
app.use('/api/subscription', SubscriptionRoutes)
app.use('/api/comment', CommnetRoutes)
app.use('/api/like', LikeRouter)
app.use('/api/playlist', PlaylistRouter)
app.use('/api/admin', AdminRouter)

export default app

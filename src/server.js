import dotenv from 'dotenv'
import ConnectDB from './DB/ConnectDB.js'
import app from './app.js'
import cors from 'cors'

dotenv.config({
    path: './.env'
})

app.use(cors({
    origin: 'http://localhost:5173/',
    credentials: true
}))

ConnectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err)
    })
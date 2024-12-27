import dotenv from 'dotenv'
import ConnectDB from './DB/ConnectDB.js'
import app from './app.js'

dotenv.config({
    path : './.env'
})

ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=> {
        console.log(`Server is running on http://localhost:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ", err)
})
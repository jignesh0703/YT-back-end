import mongoose from 'mongoose'

const ConnectDB = async() => {
    try {
        await mongoose.connect(`${process.env.mongodb_URL}`)
        .then(console.log('database connected Succesfully!'))
    } catch (error) {
        console.log("Don't Connect to database")
        process.exit(1)
    }
}

export default ConnectDB
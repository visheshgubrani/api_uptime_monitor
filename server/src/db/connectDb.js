import mongoose from 'mongoose'

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/api_uptime_monitor`)
  } catch (error) {
    console.log(`Databse connection error: ${error}`)
    process.exit(1)
  }
}

export default connectDb

import app from './app.js'
import connectDb from './db/connectDb.js'
import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

connectDb()
  .then(() => {
    const port = process.env.PORT || 4080
    app.listen(port, () => {
      console.log(`http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.log(`The server failed to run: ${error}`)
  })

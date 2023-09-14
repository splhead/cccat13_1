import express from 'express'
import { AccountService } from './AccountService'

const app = express()
const PORT = 3000

// const accountService = new AccountService()

app.listen(PORT, () => {
  console.log(`app runing on ${PORT}`)
})

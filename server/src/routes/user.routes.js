import { Router } from 'express'
import {
  createUser,
  loginUser,
  logoutUser,
} from '../controllers/user.controller.js'
import verifyJwt from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/register').post(createUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt, logoutUser)

export default router

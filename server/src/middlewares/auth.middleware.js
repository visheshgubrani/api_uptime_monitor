import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import User from '../models/user.model.js'

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      throw new ApiError(400, 'user is not authorized')
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    )
    if (!user) {
      throw new ApiError(402, 'Invalid Access Token')
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token')
  }
})

export default verifyJwt

import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    console.log(`Failed to generate Tokens`)
    throw new ApiError(500, 'Unable to generate Tokens')
  }
}

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!(name && email && password)) {
    throw new ApiError('400', 'All fields are required')
  }
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(400, 'User exists')
  }
  const user = await User.create({
    name,
    email,
    password,
  })
  const createdUser = await User.findById(user?._id).select(
    '-password -refreshToken'
  )
  return res
    .status(200)
    .json(new ApiResponse(200, 'User created successfully', createdUser))
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!(email && password)) {
    throw new ApiError(400, 'All fields are required')
  }
  const existingUser = await User.findOne({ email })
  if (!existingUser) {
    throw new ApiError(400, 'User does not found')
  }

  const isPasswordCorrect = await existingUser.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Password is not correct')
  }

  const { accessToken, refreshToken } = await generateTokens(existingUser?._id)
  const loggedInUser = await User.findById(existingUser?._id).select(
    '-password -refreshToken'
  )
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  }
  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, 'User loggedin successfully', {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user?._id
  if (!user) {
    throw new ApiError(400, 'User is not logged in')
  }
  await User.findByIdAndUpdate(
    user,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  )
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  }
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, 'user logged out successfully'))
})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!(oldPassword && newPassword)) {
    throw new ApiError(400, 'please provide old and new password')
  }
  const user = await User.findById(req.user?._id)
  const isCurrentPasswordCorrect = await user.comparePassword(oldPassword)
  if (!isCurrentPasswordCorrect) {
    throw new ApiError(400, 'Incorrect Old Password')
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, 'Password changed successfully', {}))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized')
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_ACCESS_TOKEN
    )
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used')
    }
    const options = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    }
    const { accessToken, newRefreshToken } = await generateTokens(user._id)
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(200, 'Access Token Refreshed Successfully', {
          accessToken,
          refreshToken: newRefreshToken,
        })
      )
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token')
  }
})
/* getProfile	Fetch user details (name, email, etc.).
updateProfile	Allow user to update profile details (e.g., name, email).
forgotPassword	Send reset token to email when user forgets password.
resetPassword	Verify reset token and allow user to set a new password.
deleteAccount	Let user permanently delete their account.
getAllUsers (Admin)	Fetch all users (for an admin panel).
toggle2FA	Enable/disable two-factor authentication (optional).*/

export { createUser, loginUser, logoutUser, changePassword }

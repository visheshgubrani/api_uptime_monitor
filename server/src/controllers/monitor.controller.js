import Monitor from '../models/monitor.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import checkUrl from '../utils/checkUrl.js'

const createMonitor = asyncHandler(async (req, res) => {
  const { url } = req.body
  const userId = req.user?._id
  if (!url) {
    throw new ApiError(400, 'Url is missing')
  }
  const monitor = await Monitor.create({
    url,
    userId,
  })
  return res
    .status(200)
    .json(new ApiResponse(200, 'Monitor Created Successfully', monitor))
})

const getMonitors = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  if (!userId) {
    throw new ApiError(400, 'User not Authorised')
  }
  const monitors = await Monitor.find({ userId: userId })
  if (!monitors) {
    throw new ApiError(400, 'No monitors for the user available')
  }
  return res
    .json(200)
    .json(new ApiResponse(200, 'User monitors fetched successfully', monitors))
})

const updateMonitorStatus = asyncHandler(async (req, res) => {
  const { monitorId } = req.params
  const monitor = await Monitor.findById(monitorId)
  if (!monitor) {
    throw new ApiError(404, 'Monitor not found')
  }
  const status = await checkUrl(monitor.url)
  monitor.status = status
  monitor.lastChecked = new Date()
  monitor.history.push({
    status,
    checkedAt: new Date(),
  })
  await monitor.save()
  return res
    .status(200)
    .json(new ApiResponse(200, 'Monitor Status Updated Successfully', monitor))
})

const deleteMonitor = asyncHandler(async (req, res) => {
  const { monitorId } = req.params
  const monitor = await Monitor.findByIdAndDelete(monitorId)
  if (!monitor) {
    throw new ApiError(404, 'Monitor not found')
  }
  return res
    .json(200)
    .json(new ApiResponse(200, 'Monitor Deleted Successfully', {}))
})

export { createMonitor, getMonitors, updateMonitorStatus, deleteMonitor }

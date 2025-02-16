class ApiError extends Error {
  constructor(statusCode, message = 'failed', errors = [], stack = '') {
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.errors = errors
    this.data = null
    this.success = false
  }
}
export default ApiError

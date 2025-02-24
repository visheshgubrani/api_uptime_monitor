import axios from 'axios'

const checkUrl = async (url) => {
  try {
    await axios.get(url, { timeout: 5000 })
    return 'up '
  } catch (error) {
    return 'down'
  }
}

export default checkUrl

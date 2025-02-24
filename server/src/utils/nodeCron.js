import cron from 'node-cron'
import Monitor from '../models/monitor.model.js'
import checkUrl from './checkUrl'

cron.schedule('*/5 * * * *', async () => {
  try {
    const monitors = await Monitor.find({})
    // Check each url
    for (const monitor of monitors) {
      const status = await checkUrl(monitor.url)

      monitor.status = status
      monitor.lastChecked = new Date()
      monitor.history.push({
        status,
        checkedAt: new Date(),
      })
      await monitor.save(console.error('Error checking monitors', error))
    }
  } catch (error) {}
})

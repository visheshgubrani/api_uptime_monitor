import mongoose from 'mongoose'

const monitorSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    interval: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['up', 'down', 'unknown'],
      default: 'unknown',
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    history: [
      {
        status: {
          type: String,
          enum: ['up', 'down'],
        },
        checkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

const Monitor = mongoose.model('Monitor', monitorSchema)
export default Monitor

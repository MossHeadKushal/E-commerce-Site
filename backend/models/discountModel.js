import mongoose from 'mongoose'

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  applicableCategories: [{ type: String }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
}, { timestamps: true })

const discountModel = mongoose.models.discount || mongoose.model('discount', discountSchema)

export default discountModel
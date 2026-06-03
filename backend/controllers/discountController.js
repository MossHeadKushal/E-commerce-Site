import discountModel from '../models/discountModel.js'

// Get all active discounts
const getDiscounts = async (req, res) => {
  try {
    const discounts = await discountModel.find({ isActive: true, validUntil: { $gte: new Date() } })
      .select('code description discountType value minOrderAmount validUntil')
      .sort({ createdAt: -1 })

    res.json({ success: true, discounts })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Add new discount (admin only)
const addDiscount = async (req, res) => {
  try {
    const { code, description, discountType, value, minOrderAmount, maxDiscount, validUntil, usageLimit, applicableCategories } = req.body

    const discount = new discountModel({
      code: code.toUpperCase(),
      description,
      discountType,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      validUntil: new Date(validUntil),
      usageLimit,
      applicableCategories
    })

    await discount.save()
    res.json({ success: true, message: 'Discount added successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Update discount
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (updates.code) {
      updates.code = updates.code.toUpperCase()
    }

    await discountModel.findByIdAndUpdate(id, updates)
    res.json({ success: true, message: 'Discount updated successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Delete discount
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params
    await discountModel.findByIdAndDelete(id)
    res.json({ success: true, message: 'Discount deleted successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Validate discount code
const validateDiscount = async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    const normalizedCode = code?.trim().toUpperCase()

    const discount = await discountModel.findOne({
      code: normalizedCode,
      isActive: true,
      validUntil: { $gte: new Date() },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })

    if (!discount) {
      return res.json({ success: false, message: 'Invalid or expired discount code' })
    }

    if (orderAmount < discount.minOrderAmount) {
      return res.json({ success: false, message: `Minimum order amount is Rs. ${discount.minOrderAmount}` })
    }

    let discountAmount = 0
    if (discount.discountType === 'percentage') {
      discountAmount = (orderAmount * discount.value) / 100
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount
      }
    } else {
      discountAmount = discount.value
    }

    res.json({
      success: true,
      discount: {
        code: discount.code,
        description: discount.description,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { getDiscounts, addDiscount, updateDiscount, deleteDiscount, validateDiscount }
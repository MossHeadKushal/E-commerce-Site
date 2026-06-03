import express from 'express'
import { getDiscounts, addDiscount, updateDiscount, deleteDiscount, validateDiscount } from '../controllers/discountController.js'
import adminAuth from '../middleware/adminAuth.js'

const discountRouter = express.Router()

discountRouter.get('/list', getDiscounts)
discountRouter.post('/add', adminAuth, addDiscount)
discountRouter.put('/update/:id', adminAuth, updateDiscount)
discountRouter.delete('/delete/:id', adminAuth, deleteDiscount)
discountRouter.post('/validate', validateDiscount)

export default discountRouter
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import discountRouter from './routes/discountRoute.js'
import recommendationRouter from "./routes/recommendation.js";
import productsRouter from "./routes/products.js";




//App Config

const app = express()
const port = process.env.PORT || 5000
connectDb()
connectCloudinary()

// Seed initial discounts
const seedDiscounts = async () => {
  try {
    const discountModel = (await import('./models/discountModel.js')).default
    
    // Check for each discount individually and add if missing
    const test5Exists = await discountModel.findOne({ code: 'TEST5' })
    if (!test5Exists) {
      await discountModel.create({
        code: 'TEST5',
        description: '5% off for testing (no minimum)',
        discountType: 'percentage',
        value: 5,
        minOrderAmount: 0,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true
      })
      console.log('TEST5 discount added')
    }
    
    const existingDiscounts = await discountModel.countDocuments()
    if (existingDiscounts === 0) {
      const discounts = [
        {
          code: 'WELCOME10',
          description: '10% off on first order',
          discountType: 'percentage',
          value: 10,
          minOrderAmount: 500,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true
        },
        {
          code: 'SUMMER20',
          description: '20% off on summer collection',
          discountType: 'percentage',
          value: 20,
          minOrderAmount: 1000,
          maxDiscount: 500,
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          isActive: true
        },
        {
          code: 'FLAT100',
          description: 'Flat Rs. 100 off',
          discountType: 'fixed',
          value: 100,
          minOrderAmount: 800,
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          isActive: true
        }
      ]
      await discountModel.insertMany(discounts)
      console.log('Initial discounts seeded successfully')
    }
  } catch (error) {
    console.log('Error seeding discounts:', error)
  }
}

seedDiscounts()

//middlewears
app.use(express.json())
app.use(cors({
  origin: ['https://kushalwears.kharel-kushal57.workers.dev', 'http://localhost:5000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/discount', discountRouter)
app.use("/api/recommendation", recommendationRouter);
app.use("/api/products", productsRouter);

app.get('/',(req,res)=>{
    res.send('api working')
})

app.listen(port, ()=> console.log('server started on port'+ port))

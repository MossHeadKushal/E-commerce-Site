import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import recommendationRouter from "./routes/recommendation.js";
import productsRouter from "./routes/products.js";




//App Config

const app = express()
const port = process.env.PORT || 5000
connectDb()
connectCloudinary()

//middlewears
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use("/api/recommendation", recommendationRouter);
app.use("/api/products", productsRouter);

app.get('/',(req,res)=>{
    res.send('api working')
})

app.listen(port, ()=> console.log('server started on port'+ port))

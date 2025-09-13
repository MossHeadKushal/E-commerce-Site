import {v2 as cloudinary} from 'cloudinary'
import productModel from '../models/productModel.js'
import axios from 'axios'

// function for add product 
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    // 🔍 Check if product with same name, category, and subCategory already exists
    const existingProduct = await productModel.findOne({ 
      name: name.trim(), 
      category, 
      subCategory 
    });

    if (existingProduct) {
      return res.json({ success: false, message: "Product already exists!" });
    }

    // --- Upload images ---
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];

    const images = [image1, image2, image3].filter((item) => item !== undefined);

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    // --- Prepare product data ---
    const productData = {
      name: name.trim(),
      description,
      price: Number(price),
      image: imagesUrl,
      category,
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes), // [{ size: "M", stock: 5 }]
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// function for list product
const listProducts= async (req,res)=>{
        try {
            const products = await productModel.find({});
            res.json({success:true, products})
        } catch (error) {
            console.log(error);
            
            
        }
}

//fumction for remove product
const removeProduct = async(req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message:"Product removed"})
    } catch (error) {
                console.log(error)
            res.json({success:false, message:error.message})
        
    }

}

// function for single product info
const singleProduct = async (req, res)=>{
        try {
            const {productId} =req.body
            const product =await productModel.findById(productId)
            res.json({success:false, product})
        } catch (error) {
            
        }
}

// function for update stock

const updateStock = async (req, res) => {
  try {
    const { productId, sizes } = req.body; // sizes = [{ size: "M", stock: 10 }]

    const safeSizes = sizes.map((s) => ({
      size: s.size,
      stock: Math.max(0, Number(s.stock)) // clamp at 0
    }));

    const product = await productModel.findByIdAndUpdate(
      productId,
      { sizes: safeSizes },
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Stock updated", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


export {listProducts, addProduct, removeProduct, singleProduct, updateStock}
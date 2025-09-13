import express from "express";
import Product from "../models/productModel.js";

const recommendationRouter = express.Router();

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

function productToVector(product) {
  return [
    product.price / 1000,
    product.category?.toLowerCase() === "men" ? 1 : 0,
    product.category?.toLowerCase() === "women" ? 1 : 0,
    product.subCategory?.toLowerCase() === "topwear" ? 1 : 0,
    product.subCategory?.toLowerCase() === "bottomwear" ? 1 : 0,
  ];
}

recommendationRouter.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const clickedProduct = await Product.findById(productId);

    if (!clickedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allProducts = await Product.find({ _id: { $ne: clickedProduct._id } });

    const clickedVector = productToVector(clickedProduct);

    const similarities = allProducts.map((product) => {
      const productVector = productToVector(product);
      return {
        product,
        similarity: cosineSimilarity(clickedVector, productVector),
      };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);

    const recommendedProducts = similarities.slice(0, 5).map((item) => item.product);

    res.json(recommendedProducts);
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default recommendationRouter;

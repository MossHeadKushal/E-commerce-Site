import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import axios from "axios";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(shopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const res = await axios.get(`/api/recommendation/${productId}`);
      setRelatedProducts(res.data);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchRelatedProducts();
  }, [productId]);

  if (!productData) return <div className="opacity-0"></div>;

  // total stock = sum of all sizes
  const totalStock = productData.sizes.reduce((acc, s) => acc + s.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <div className="border-t-2 pt-10">
      {/* Product Info Section */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll sm:w-[18.7%]">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt="" />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>

          {/* Show Stock */}
          <p
            className={`mt-3 font-medium ${
              isOutOfStock ? "text-red-500" : "text-green-600"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : `Total Stock Available: ${totalStock}`}
          </p>

          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          {/* Size Selector */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSize(s)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    selectedSize?.size === s.size ? "border-orange-500" : ""
                  }`}
                  disabled={s.stock === 0}
                >
                  {s.size} ({s.stock})
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart button */}
          {isOutOfStock ? (
            <button
              className="bg-gray-400 text-white px-8 py-3 text-sm cursor-not-allowed"
              disabled
            >
              OUT OF STOCK
            </button>
          ) : (
            <button
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a product size"); // or use toast
                  return;
                }
                addToCart(productData._id, selectedSize.size, 1); // size + qty
              }}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              {selectedSize ? "ADD TO CART" : "SELECT SIZE"}
            </button>
          )}

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on Delivery is also available</p>
            <p>Easy return and exchange policy within 1 week</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h1 className="text-xl font-bold mt-10 border-b pb-2">
          Related Products
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
            relatedProducts.map((item, index) => (
              <ProductItem
                key={index}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
          ) : (
            <p>No related products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;

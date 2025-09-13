import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]); // array of {size: "S", stock: 0}

  const [loading, setLoading] = useState(false); // 🚀 new state

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return; // 🚫 prevent multiple submissions
    setLoading(true);

    if (sizes.length === 0) {
      toast.error("Please select at least one size and provide stock.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("Men");
        setSubCategory("Topwear");
        setBestseller(false);
        setSizes([]);
        setImage1(null);
        setImage2(null);
        setImage3(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setLoading(false); // ✅ re-enable button after request finishes
    }
  };

  const toggleSize = (size) => {
    const existing = sizes.find((s) => s.size === size);
    if (existing) {
      setSizes(sizes.filter((s) => s.size !== size));
    } else {
      setSizes([...sizes, { size, stock: 0 }]);
    }
  };

  const updateSizeStock = (size, stock) => {
    setSizes(
      sizes.map((s) => (s.size === size ? { ...s, stock: Number(stock) } : s))
    );
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      {/* Images */}
      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-2">
          {[image1, image2, image3].map((img, idx) => {
            const setImg = [setImage1, setImage2, setImage3][idx];
            return (
              <label key={idx} htmlFor={`image${idx + 1}`}>
                <img
                  className="w-20"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=""
                />
                <input
                  type="file"
                  id={`image${idx + 1}`}
                  hidden
                  onChange={(e) => setImg(e.target.files[0])}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Basic Details */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Type here"
          className="w-full max-w-[500px] px-3 py-2"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Description</p>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          type="text"
          placeholder="Write content here"
          className="w-full max-w-[500px] px-3 py-2"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Price</p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min={0}
            placeholder="250"
            className="w-full px-3 py-2 sm:w-[120px]"
            required
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2">Select Sizes & Stock</p>
        <div className="flex gap-4 items-center">
          {["S", "M", "L"].map((s) => {
            const selected = sizes.find((size) => size.size === s);
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <p
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1 cursor-pointer ${
                    selected ? "bg-pink-200" : "bg-slate-100"
                  }`}
                >
                  {s}
                </p>
                {selected && (
                  <input
                    type="number"
                    min={0}
                    value={selected.stock}
                    onChange={(e) => updateSizeStock(s, e.target.value)}
                    placeholder="Stock"
                    className="w-16 px-2 py-1 border"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bestseller */}
      <div className="flex gap-2 mt-2">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={() => setBestseller((prev) => !prev)}
        />
        <label htmlFor="bestseller" className="cursor-pointer">
          Add to bestseller
        </label>
      </div>

      <button
        className="w-28 pt-3 mt-4 bg-black text-white disabled:opacity-50"
        type="submit"
        disabled={loading} // 🚫 disabled while loading
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
};

export default Add;

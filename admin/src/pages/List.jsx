import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingProduct, setEditingProduct] = useState({}); // track edits

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateProduct = async (id) => {
    const updates = editingProduct[id];
    try {
      const response = await axios.put(
        backendUrl + "/api/product/update-stock",
        { productId: id, ...updates },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Product updated!");
        setEditingProduct({ ...editingProduct, [id]: {} });
        await fetchList();
      } else {
        // toast.error(response.data.message);
      }
    } catch (error) {
      // toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2 font-semibold text-lg">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center py-2 px-2 border bg-gray-100 text-sm font-semibold">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b>Change Image</b>
          <b>Save</b>
          <b className="text-center">Action</b>
        </div>

        {/* Product Rows */}
        {list.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center gap-2 py-2 px-2 border text-sm"
          >
            {/* Current Image */}
            <img
              src={item.image[0]}
              alt=""
              className="w-12 h-12 object-cover rounded"
            />

            {/* Name */}
            <input
              type="text"
              value={editingProduct[item._id]?.name ?? item.name}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  [item._id]: {
                    ...editingProduct[item._id],
                    name: e.target.value,
                  },
                })
              }
              className="border p-1 w-full"
            />

            {/* Category */}
            <input
              type="text"
              value={editingProduct[item._id]?.category ?? item.category}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  [item._id]: {
                    ...editingProduct[item._id],
                    category: e.target.value,
                  },
                })
              }
              className="border p-1 w-full"
            />

            {/* Price */}
            <input
              type="number"
              min="0"
              value={editingProduct[item._id]?.price ?? item.price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  [item._id]: {
                    ...editingProduct[item._id],
                    price: e.target.value,
                  },
                })
              }
              className="border p-1 w-20"
            />

            {/* Stock Per Size */}
            <div className="flex flex-col gap-1">
              {(editingProduct[item._id]?.sizes ?? item.sizes).map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-6 text-xs">{s.size}</span>
                  <input
                    type="number"
                    min="0"
                    value={s.stock}
                    onChange={(e) => {
                      const newStock = Math.max(0, Number(e.target.value));
                      const updatedSizes = [
                        ...(editingProduct[item._id]?.sizes ?? item.sizes),
                      ];
                      updatedSizes[i] = { ...s, stock: newStock };

                      setEditingProduct({
                        ...editingProduct,
                        [item._id]: {
                          ...editingProduct[item._id],
                          sizes: updatedSizes,
                        },
                      });
                    }}
                    className="border p-1 w-16"
                  />
                </div>
              ))}
            </div>

            {/* Upload New Image */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  [item._id]: {
                    ...editingProduct[item._id],
                    newImage: e.target.files[0],
                  },
                })
              }
              className="border p-1 w-full"
            />

            {/* Save Button */}
            <button
              onClick={() => updateProduct(item._id)}
              className="text-right md:text-center cursor-pointer text-lg text-green-600"
            >
              ✔
            </button>

            {/* Delete */}
            <p
              onClick={() => removeProduct(item._id)}
              className="text-right md:text-center cursor-pointer text-lg text-red-600"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;

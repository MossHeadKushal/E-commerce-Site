import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets, products } from "../assets/assets";
import { shopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(shopContext);

  // Initialize from localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("deliveryForm");
    return saved
      ? JSON.parse(saved)
      : {
          firstName: "",
          lastName: "",
          email: "",
          street: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          phone: "",
        };
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("deliveryForm", JSON.stringify(formData));
  }, [formData]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemsInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemsInfo) {
              itemsInfo.size = item;
              itemsInfo.quantity = cartItems[items][item];
              orderItems.push(itemsInfo);
            }
          }
        }
      }

      // console.log(orderItems);

      // Order data common for both COD and Khalti
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        userId: token.userId, // assuming your token contains userId
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        purchase_order_id: `Order${Date.now()}`,
        purchase_order_name: "My Order",
      };

      switch (method) {
        // COD API call
        case "cod":
          const responseCOD = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );

          if (responseCOD.data.success) {
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(responseCOD.data.message);
          }
          break;

        // Khalti API call using server-side initiate
        case "khalti":
          const responseKhalti = await axios.post(
            backendUrl + "/api/order/khalti/",
            orderData,
            { headers: { token } }
          );

          if (responseKhalti.data.success && responseKhalti.data.payment_url) {
            // Redirect user to Khalti payment page
            window.location.href = responseKhalti.data.payment_url;
          } else {
            toast.error(
              responseKhalti.data.message || "Failed to initiate Khalti payment"
            );
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/** forLeft side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            value={formData.firstName}
            name="firstName"
            type="text"
            placeholder="Enter your First Name"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input
            required
            onChange={onChangeHandler}
            value={formData.lastName}
            name="lastName"
            type="text"
            placeholder="Enter your Last Name"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          value={formData.email}
          name="email"
          type="email"
          placeholder="Enter your Email Address"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <input
          required
          onChange={onChangeHandler}
          value={formData.street}
          name="street"
          type="text"
          placeholder="Enter your Street Name"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            value={formData.city}
            name="city"
            type="text"
            placeholder="Enter your City"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input
            required
            onChange={onChangeHandler}
            value={formData.state}
            name="state"
            type="text"
            placeholder="Enter your State"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            value={formData.zipcode}
            name="zipcode"
            type="number"
            placeholder="Enter your Zipcode"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input
            required
            onChange={onChangeHandler}
            value={formData.country}
            name="country"
            type="text"
            placeholder="Enter your Country"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          value={formData.phone}
          name="phone"
          type="number"
          placeholder="Enter your Number"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
      </div>

      {/**Right side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/**Payment Method Selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("khalti")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "khalti" ? "bg-green-400" : ""
                }`}
              ></p>
              <img src={assets.khalti} className="h-12 mx-8" alt="" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { dbConnect } from "~/services/mongodb.server";
import { OrderModel } from "~/services/orderModel.server";

// List of admin wallet addresses (lowercase)
const adminWallets = [
  "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be".toLowerCase(),
  // Add more if needed
];

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await dbConnect();
    
    const url = new URL(request.url);
    const wallet = url.searchParams.get("wallet");
    
    if (wallet === "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be") {
      // Admin wallet - return all orders
      const orders = await OrderModel.find({}).sort({ createdAt: -1 });
      return json({ orders });
    } else {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return json({ error: "Failed to fetch orders" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log("Received order data:", body);
    
    const order = new OrderModel(body);
    await order.save();
    
    console.log("Order saved successfully:", order._id);
    return json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("Error saving order:", error);
    return json({ error: "Failed to save order" }, { status: 500 });
  }
}; 
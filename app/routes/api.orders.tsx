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
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.toLowerCase();
  if (!wallet || !adminWallets.includes(wallet)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await dbConnect();
    const orders = await OrderModel.find({}).sort({ timestamp: -1 }).lean();
    return json({ orders });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return json({ error: "Database connection failed" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const data = await request.json();
    await dbConnect();
    const order = await OrderModel.create(data);
    return json({ order });
  } catch (error) {
    console.error("MongoDB save error:", error);
    return json({ error: "Failed to save order" }, { status: 500 });
  }
}; 
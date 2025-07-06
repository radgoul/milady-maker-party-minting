import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { dbConnect } from "~/services/mongodb.server";
import { OrderModel } from "~/services/orderModel.server";

// List of admin wallet addresses (lowercase for consistent comparison)
const adminWallets = [
  "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be".toLowerCase(),
  // Add more if needed
];

// Rate limiting - simple in-memory store (consider Redis for production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter((time: number) => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  return true;
}

function isAuthorizedAdmin(wallet: string | null): boolean {
  if (!wallet) return false;
  return adminWallets.includes(wallet.toLowerCase());
}

export const loader: LoaderFunction = async ({ request }) => {
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  
  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    return json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");
  
  if (!isAuthorizedAdmin(wallet)) {
    return json({ error: "Unauthorized access" }, { status: 401 });
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
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  
  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    return json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await request.json();
    
    // Input validation
    if (!data.walletAddress || !data.shippingInfo || typeof data.timestamp !== 'number') {
      return json({ error: "Invalid order data" }, { status: 400 });
    }

    // Validate wallet address format (basic Ethereum address validation)
    if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
      return json({ error: "Invalid wallet address format" }, { status: 400 });
    }

    // Sanitize shipping info if not anonymous
    if (!data.isAnonymous && data.shippingInfo) {
      const sanitizedShippingInfo = {
        name: data.shippingInfo.name?.substring(0, 100) || "",
        email: data.shippingInfo.email?.substring(0, 100) || "",
        address: data.shippingInfo.address?.substring(0, 200) || "",
        city: data.shippingInfo.city?.substring(0, 50) || "",
        state: data.shippingInfo.state?.substring(0, 50) || "",
        postalCode: data.shippingInfo.postalCode?.substring(0, 20) || "",
        country: data.shippingInfo.country?.substring(0, 50) || "",
        size: data.shippingInfo.size?.substring(0, 10) || "",
        isPoBox: Boolean(data.shippingInfo.isPoBox)
      };
      data.shippingInfo = sanitizedShippingInfo;
    }

    await dbConnect();
    const order = await OrderModel.create(data);
    return json({ order });
  } catch (error) {
    console.error("MongoDB save error:", error);
    return json({ error: "Failed to save order" }, { status: 500 });
  }
}; 
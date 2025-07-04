const mongoose = require('mongoose');
require('dotenv').config();

const ShippingInfoSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  size: String,
  isPoBox: Boolean,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  walletAddress: { type: String, required: true },
  shippingInfo: { type: ShippingInfoSchema, required: true },
  timestamp: { type: Number, required: true },
  isAnonymous: { type: Boolean, required: true },
  tokenIds: [String],
});

const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const orders = await OrderModel.find({}).sort({ timestamp: -1 });
    
    console.log(`\n📊 Total Orders: ${orders.length}\n`);
    
    if (orders.length === 0) {
      console.log('No orders found yet.');
      return;
    }
    
    orders.forEach((order, index) => {
      console.log(`--- Order ${index + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Wallet: ${order.walletAddress}`);
      console.log(`Date: ${new Date(order.timestamp).toLocaleString()}`);
      console.log(`Anonymous: ${order.isAnonymous ? 'Yes' : 'No'}`);
      
      if (!order.isAnonymous) {
        console.log(`Name: ${order.shippingInfo.name}`);
        console.log(`Email: ${order.shippingInfo.email}`);
        console.log(`Address: ${order.shippingInfo.address}`);
        console.log(`City: ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postalCode}`);
        console.log(`Country: ${order.shippingInfo.country}`);
        console.log(`Size: ${order.shippingInfo.size}`);
        console.log(`PO Box: ${order.shippingInfo.isPoBox ? 'Yes' : 'No'}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrders(); 
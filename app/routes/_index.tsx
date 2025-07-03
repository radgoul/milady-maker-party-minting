import { useEffect, useState } from "react";
import { ConnectWithSelect } from "~/components/ConnectWithSelect";
import { hooks, metaMask } from "~/lib/connectors/metaMask";

const {
  useChainId,
  useIsActivating,
  useIsActive,
  useProvider,
  useAccounts,
} = hooks;

export default function Index() {
  const chainId = useChainId();
  const isActivating = useIsActivating();
  const isActive = useIsActive();
  const provider = useProvider();
  const accounts = useAccounts();

  const [error, setError] = useState<Error>();
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintType, setMintType] = useState('anonymous');
  const [shippingData, setShippingData] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: ''
  });
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showOrders, setShowOrders] = useState(false);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
    
    // Load existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('miladyOrders') || '[]');
    setAllOrders(existingOrders);
  }, []);



  const validateForm = () => {
    const errors: string[] = [];
    
    if (mintType === 'identified') {
      if (!shippingData.fullName.trim()) errors.push("Full name is required");
      if (!shippingData.streetAddress.trim()) errors.push("Street address is required");
      if (!shippingData.city.trim()) errors.push("City is required");
      if (!shippingData.state.trim()) errors.push("State is required");
      if (!shippingData.zipCode.trim()) errors.push("ZIP code is required");
      if (!shippingData.country.trim()) errors.push("Country is required");
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!shippingData.email.trim()) {
        errors.push("Email is required");
      } else if (!emailRegex.test(shippingData.email)) {
        errors.push("Please enter a valid email address");
      }
      
      // ZIP code validation (basic US format)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (shippingData.country.toLowerCase() === 'usa' || shippingData.country.toLowerCase() === 'united states') {
        if (!zipRegex.test(shippingData.zipCode)) {
          errors.push("Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)");
        }
      }
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation for shipping orders
    if (mintType === 'identified') {
      setShowConfirmation(true);
      return;
    }
    
    // Proceed with anonymous mint
    await processMint();
  };

  const processMint = async () => {
    // Show minting in progress
    setMintSuccess(false);
    setOrderDetails(null);
    setShowConfirmation(false);
    
    try {
      // Create order details
      const order = {
        walletAddress: accounts?.[0] || 'Unknown',
        mintType: mintType,
        timestamp: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated hash
        shippingData: mintType === 'identified' ? shippingData : null
      };
      
      // Store order in localStorage (in production, send to your database)
      const existingOrders = JSON.parse(localStorage.getItem('miladyOrders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('miladyOrders', JSON.stringify(existingOrders));
      setAllOrders(existingOrders);
      
      // Simulate actual minting process
      // In real implementation, this would be:
      // const tx = await contract.mint(...);
      // await tx.wait();
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success after "minting" completes
      setMintSuccess(true);
      setOrderDetails(order);
      const bombSound = new Audio("/bomb-has-been-planted-sound-effect-cs-go.mp3");
      bombSound.play();
      
      // Reset form
      if (mintType === 'identified') {
        setShippingData({
          fullName: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          email: ''
        });
      }
      
      // Reset after 5 seconds
      setTimeout(() => {
        setMintSuccess(false);
        setOrderDetails(null);
      }, 5000);
      
    } catch (error) {
      console.error("Minting failed:", error);
      // Don't play bomb sound if minting fails
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Background Music - Synced to real-world time */}
      
      <style>
        {`
          @font-face {
            font-family: 'Goosebumps';
            src: url('/fonts/Goosebump.otf') format('opentype');
          }
          .goosebumps-font {
            font-family: 'Goosebumps', cursive;
          }
        `}
      </style>
      
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/tag001.png" 
            alt="Logo" 
            className="mx-auto mb-4"
            style={{ maxWidth: '200px' }}
          />
        </div>
        
        <h1 className="text-6xl font-bold mb-8 text-center goosebumps-font text-red-500">
          MAKE AMERICA GOUL AGAIN!!!
        </h1>
        

        

        
        {mintSuccess && (
          <div className="text-center mb-8">
            <div className="text-green-400 text-2xl font-bold mb-4">
              💣 MINT SUCCESSFUL! 💣
            </div>
            {orderDetails && (
              <div className="bg-gray-900 p-6 rounded-lg border border-green-500 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-4 text-green-400">Order Details</h3>
                <div className="text-left space-y-2">
                  <p><strong>Wallet:</strong> {orderDetails.walletAddress}</p>
                  <p><strong>Type:</strong> {orderDetails.mintType === 'identified' ? 'With Shipping' : 'Anonymous'}</p>
                  <p><strong>Transaction:</strong> {orderDetails.transactionHash}</p>
                  <p><strong>Date:</strong> {new Date(orderDetails.timestamp).toLocaleString()}</p>
                  
                  {orderDetails.shippingData && (
                    <div className="mt-4 p-4 bg-gray-800 rounded border border-purple-500">
                      <h4 className="font-bold text-purple-400 mb-2">Shipping Information:</h4>
                      <p><strong>Name:</strong> {orderDetails.shippingData.fullName}</p>
                      <p><strong>Address:</strong> {orderDetails.shippingData.streetAddress}</p>
                      <p><strong>City:</strong> {orderDetails.shippingData.city}, {orderDetails.shippingData.state} {orderDetails.shippingData.zipCode}</p>
                      <p><strong>Country:</strong> {orderDetails.shippingData.country}</p>
                      <p><strong>Email:</strong> {orderDetails.shippingData.email}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Order saved to local storage. In production, this would be sent to your database.
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mb-8">
          {isActive ? (
            <div className="text-center">
              <div className="text-green-400 text-xl mb-4">✅ Wallet Connected!</div>
              <div className="text-purple-400 mb-4">
                Address: {accounts?.[0]?.slice(0, 6)}...{accounts?.[0]?.slice(-4)}
              </div>
              <button
                onClick={() => {
                  if (metaMask?.deactivate) {
                    void metaMask.deactivate();
                  } else {
                    void metaMask.resetState();
                  }
                }}
                className="text-red-400 underline hover:text-red-300"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <ConnectWithSelect
              connector={metaMask}
              activeChainId={chainId}
              chainIds={[1, 11155111]}
              isActivating={isActivating}
              isActive={isActive}
              error={error}
              setError={setError}
            />
          )}
        </div>

        {isActive && (
          <div className="mb-8">
            <form className="space-y-4" onSubmit={handleMint}>
              <div>
                <label className="block mb-2">Mint Type</label>
                <select 
                  className="border p-2 w-full" 
                  value={mintType}
                  onChange={(e) => {
                    setMintType(e.target.value);
                    const fields = document.getElementById('identified-fields');
                    if (fields) {
                      fields.className = e.target.value === 'identified' ? 'block' : 'hidden';
                    }
                  }}
                >
                  <option value="anonymous">Anonymous - Just NFT</option>
                  <option value="identified">With Shipping - Get Physical Shirt</option>
                </select>
              </div>

              <div id="identified-fields" className={`${mintType === 'identified' ? 'block' : 'hidden'} space-y-4`}>
                <div className="p-4 bg-gray-900 rounded-lg border border-purple-500 mb-4">
                  <h3 className="text-purple-400 font-bold mb-2">📦 Shipping Information</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Please double-check your information carefully. This will be used to ship your physical shirt.
                  </p>
                </div>
                
                <div>
                  <label className="block mb-2 text-purple-400">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full legal name" 
                    value={shippingData.fullName}
                    onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-purple-400">Street Address *</label>
                  <input 
                    type="text" 
                    placeholder="123 Main Street, Apt 4B" 
                    value={shippingData.streetAddress}
                    onChange={(e) => setShippingData({...shippingData, streetAddress: e.target.value})}
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-purple-400">City *</label>
                    <input 
                      type="text" 
                      placeholder="New York" 
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-purple-400">State/Province *</label>
                    <input 
                      type="text" 
                      placeholder="NY" 
                      value={shippingData.state}
                      onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                      className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-purple-400">ZIP/Postal Code *</label>
                    <input 
                      type="text" 
                      placeholder="10001" 
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({...shippingData, zipCode: e.target.value})}
                      className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-purple-400">Country *</label>
                    <input 
                      type="text" 
                      placeholder="USA" 
                      value={shippingData.country}
                      onChange={(e) => setShippingData({...shippingData, country: e.target.value})}
                      className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-purple-400">Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={shippingData.email}
                    onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                  <p className="text-xs text-gray-400 mt-1">We'll use this to send you shipping updates</p>
                </div>
                
                {/* Error Display */}
                {formErrors.length > 0 && (
                  <div className="p-4 bg-red-900 border border-red-500 rounded-lg">
                    <h4 className="text-red-400 font-bold mb-2">⚠️ Please fix the following errors:</h4>
                    <ul className="text-red-300 text-sm space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button type="submit" className="bg-purple-600 px-6 py-3 text-lg font-bold rounded-lg hover:bg-purple-700 transition-colors">
                {mintSuccess ? "Minting..." : "Mint NFT"}
              </button>
            </form>
          </div>
        )}

        {/* Admin Section - View All Orders - Only visible to you */}
        {(accounts?.[0] === "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be" || 
          accounts?.[0] === "YOUR_DEV_FRIEND_WALLET_ADDRESS_HERE") && (
          <div className="mt-12 border-t border-gray-700 pt-8">
            <div className="text-center mb-6">
              <button
                onClick={() => setShowOrders(!showOrders)}
                className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                {showOrders ? 'Hide' : 'View'} All Orders ({allOrders.length})
              </button>
            </div>

          {showOrders && (
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-center">📦 All Orders ({allOrders.length})</h3>
              
              {allOrders.length === 0 ? (
                <p className="text-center text-gray-400">No orders yet. Mint some NFTs to see them here!</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allOrders.map((order, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <strong>Order #{index + 1}</strong>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            order.mintType === 'identified' ? 'bg-green-600' : 'bg-blue-600'
                          }`}>
                            {order.mintType === 'identified' ? 'With Shipping' : 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(order.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        <strong>Wallet:</strong> {order.walletAddress}
                      </p>
                      <p className="text-sm text-gray-300 mb-2">
                        <strong>Transaction:</strong> {order.transactionHash}
                      </p>
                      
                      {order.shippingData && (
                        <div className="mt-3 p-3 bg-gray-700 rounded border-l-4 border-purple-500">
                          <h4 className="font-bold text-purple-400 mb-2">📮 Shipping Info:</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p><strong>Name:</strong> {order.shippingData.fullName}</p>
                            <p><strong>Address:</strong> {order.shippingData.streetAddress}</p>
                            <p><strong>City:</strong> {order.shippingData.city}, {order.shippingData.state} {order.shippingData.zipCode}</p>
                            <p><strong>Country:</strong> {order.shippingData.country}</p>
                            <p><strong>Email:</strong> {order.shippingData.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(allOrders, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'milady-orders.json';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  📥 Download Orders JSON
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-purple-500 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4 text-purple-400">📦 Confirm Shipping Information</h3>
              
              <div className="mb-4 text-sm">
                <p className="text-gray-300 mb-3">Please review your shipping information:</p>
                <div className="bg-gray-800 p-3 rounded border border-gray-600">
                  <p><strong>Name:</strong> {shippingData.fullName}</p>
                  <p><strong>Address:</strong> {shippingData.streetAddress}</p>
                  <p><strong>City:</strong> {shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                  <p><strong>Country:</strong> {shippingData.country}</p>
                  <p><strong>Email:</strong> {shippingData.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                >
                  Edit Information
                </button>
                <button
                  onClick={processMint}
                  className="flex-1 bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Confirm & Mint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small Twitter Support Link */}
        <div className="text-center mt-8 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Questions? <a 
              href="https://x.com/0xGouL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 underline"
            >
              @0xGouL
            </a>
          </p>
        </div>

        {/* Chess Game */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-purple-400">♟️ Play Chess While You Wait ♟️</h3>
          <div className="max-w-4xl mx-auto">
            <iframe 
              style={{ width: "100%", height: "550px", overflow: "hidden", border: "none" }} 
              src="https://playpager.com/embed/chess/index.html" 
              title="Online Chess Game" 
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

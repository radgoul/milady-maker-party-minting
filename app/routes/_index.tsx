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

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  size: string;
  isPoBox: boolean;
}

interface Order {
  id: string;
  walletAddress: string;
  shippingInfo: ShippingInfo;
  timestamp: number;
  isAnonymous: boolean;
  tokenIds?: string[];
}

export default function Index() {
  const chainId = useChainId();
  const isActivating = useIsActivating();
  const isActive = useIsActive();
  const provider = useProvider();
  const accounts = useAccounts();

  const [error, setError] = useState<Error>();
  const [isMinting, setIsMinting] = useState(false);
  const [showMintForm, setShowMintForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    size: "M",
    isPoBox: false
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChess, setShowChess] = useState(false);
  const [beetlePosition, setBeetlePosition] = useState({ x: 50, y: 0 });
  const [successMessage, setSuccessMessage] = useState("");

  // Admin wallet addresses
  const adminWallets = [
    "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be",
    // Add your wallet address here to access admin panel
    // Example: "0xYOUR_WALLET_ADDRESS_HERE"
  ];

  const ADMIN_WALLET = adminWallets[0];

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  useEffect(() => {
    // Check if current wallet is admin
    if (accounts?.[0]) {
      const currentWallet = accounts[0].toLowerCase();
      const isAdmin = adminWallets.some(wallet => 
        wallet.toLowerCase() === currentWallet
      );
      
      // Temporary: Enable admin for any connected wallet (uncomment the line below)
      // setShowAdmin(true);
      
      // Normal admin check (comment out the line above and uncomment this)
      setShowAdmin(isAdmin);
    } else {
      setShowAdmin(false);
    }
  }, [accounts]);

  // Fetch orders from MongoDB for admin
  useEffect(() => {
    async function fetchOrders() {
      if (showAdmin && accounts?.[0]) {
        try {
          const res = await fetch(`/api.orders?wallet=${accounts[0]}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders || []);
          } else {
            // Fall back to local storage if MongoDB fails
            const localOrders = JSON.parse(localStorage.getItem('goul-orders') || '[]');
            setOrders(localOrders);
          }
        } catch (error) {
          // Fall back to local storage if MongoDB fails
          const localOrders = JSON.parse(localStorage.getItem('goul-orders') || '[]');
          setOrders(localOrders);
        }
      }
    }
    fetchOrders();
  }, [showAdmin, accounts]);

  // Beetle movement effect
  useEffect(() => {
    if (!showChess) {
      const interval = setInterval(() => {
        setBeetlePosition({
          x: Math.random() * 80 + 10, // Random position between 10% and 90%
          y: Math.random() * 20 // Small vertical movement
        });
      }, 3000); // Move every 3 seconds

      return () => clearInterval(interval);
    }
  }, [showChess]);

  const handleMint = async () => {
    if (!isActive || !accounts?.[0]) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!isAnonymous) {
      // Validate shipping info
      if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || 
          !shippingInfo.city || !shippingInfo.state || !shippingInfo.postalCode || !shippingInfo.size) {
        alert("Please fill in all required shipping information!");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingInfo.email)) {
        alert("Please enter a valid email address!");
        return;
      }

      // Basic postal code validation (more flexible for international)
      const postalRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
      if (!postalRegex.test(shippingInfo.postalCode)) {
        alert("Please enter a valid postal code!");
        return;
      }
    }

    setShowConfirmation(true);
  };

  const confirmMint = async () => {
    setIsMinting(true);
    setShowConfirmation(false);

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const newOrder: Order = {
        id: Date.now().toString(),
        walletAddress: accounts![0],
        shippingInfo: isAnonymous ? {
          name: "Anonymous",
          email: "anonymous@goul.com",
          address: "Anonymous",
          city: "Anonymous",
          state: "Anonymous",
          postalCode: "00000",
          country: "USA",
          size: "M",
          isPoBox: false
        } : shippingInfo,
        timestamp: Date.now(),
        isAnonymous
      };

      // Try to save order to MongoDB, but fall back to local storage if it fails
      try {
        const res = await fetch("/api.orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const data = await res.json();
          setOrders((prev) => [...prev, data.order]);
        } else {
          // Fall back to local storage if MongoDB fails
          const existingOrders = JSON.parse(localStorage.getItem('goul-orders') || '[]');
          const updatedOrders = [...existingOrders, newOrder];
          localStorage.setItem('goul-orders', JSON.stringify(updatedOrders));
          setOrders((prev) => [...prev, newOrder]);
        }
      } catch (error) {
        // Fall back to local storage if MongoDB fails
        const existingOrders = JSON.parse(localStorage.getItem('goul-orders') || '[]');
        const updatedOrders = [...existingOrders, newOrder];
        localStorage.setItem('goul-orders', JSON.stringify(updatedOrders));
        setOrders((prev) => [...prev, newOrder]);
      }

      // Play bomb sound
      const audio = new Audio("/bomb-has-been-planted-sound-effect-cs-go.mp3");
      audio.play().catch(() => console.log("Audio play failed"));

      // Show success message in-page instead of browser alert
      setSuccessMessage("🎉 NFT Minted Successfully! 🎉");
      setTimeout(() => setSuccessMessage(""), 5000); // Hide after 5 seconds
      
      // Reset form
      setShowMintForm(false);
      setIsAnonymous(false);
      setShippingInfo({
        name: "",
        email: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "USA",
        size: "M",
        isPoBox: false
      });

    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const downloadOrders = () => {
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `goul-orders-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Floating Tag Logo */}
      <img src="/tag001.png" alt="Tag Logo" className="absolute top-4 left-4 w-20 z-50 drop-shadow-lg" />

      {/* Success Message or NFT Card */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {successMessage}
        </div>
      )}
      {(() => {
        const lastOrder = orders.length > 0 ? orders[orders.length - 1] : undefined;
        if (lastOrder && lastOrder.timestamp > Date.now() - 10000) {
          return (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-gray-900 border border-purple-500 rounded-lg shadow-lg p-6 flex flex-col items-center">
                <img src="/0703.gif" alt="Your NFT" className="w-40 h-40 object-cover rounded mb-4 border-2 border-purple-500" />
                <div className="text-lg text-purple-300 mb-2 font-bold">Your NFT is minted!</div>
                <div className="text-white mb-2">
                  Token ID(s): {Array.isArray(lastOrder.tokenIds) ? lastOrder.tokenIds.join(', ') : lastOrder.id}
                </div>
                {Array.isArray(lastOrder.tokenIds) ? lastOrder.tokenIds.map((id) => (
                  <a key={id} href={`https://scatter.art/merchnftproto/${id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline block mb-1">View on Scatter #{id}</a>
                )) : (
                  <a href={`https://scatter.art/merchnftproto/${lastOrder.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline block mb-1">View on Scatter</a>
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Background GIF */}
      <div className="fixed inset-0 z-0">
        <img
          src="/0520.gif"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        />
        {/* Fallback background if image doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-red-900 opacity-50"></div>
      </div>
    
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-6xl font-bold mb-8 text-center goosebumps-font text-red-500">
                          MAKE AMERICA GOUL AGAIN
        </h1>
        
        <div className="mb-8">
          {isActive ? (
            <div className="text-center">
              <div className="text-green-400 text-xl mb-4">✅ Wallet Connected!</div>
              <div className="text-purple-400 mb-4">
                Address: {accounts?.[0]?.slice(0, 6)}...{accounts?.[0]?.slice(-4)}
    </div>

              {!showMintForm ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-4">
                    MINT PRICE: 0.02 ETH
                  </div>
                  <button
                    onClick={() => setShowMintForm(true)}
                    className="text-2xl font-bold px-8 py-4 border-2 border-purple-500 rounded-lg transition-all duration-300 goosebumps-font bg-transparent text-purple-500 hover:bg-purple-500 hover:text-white cursor-pointer"
                  >
                    MINT SHIRT NFT
                  </button>
                </div>
              ) : (
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">Mint Your GOUL Shirt NFT</h3>
                  <div className="text-xl font-bold text-yellow-400 mb-4 text-center">
                    MINT PRICE: 0.02 ETH
                  </div>
          
                  <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-600">
                    <h4 className="text-lg font-bold text-purple-400 mb-2">Choose Your Mint Option:</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          checked={!isAnonymous}
                          onChange={() => setIsAnonymous(false)}
                          className="mr-3 mt-1"
                        />
                        <div>
                          <span className="font-bold text-green-400">FULL PACKAGE - NFT + PHYSICAL SHIRT</span>
                          <p className="text-sm text-gray-300 mt-1">Provide shipping info to receive both the NFT and the physical shirt delivered to your door!</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input
                          type="radio"
                          checked={isAnonymous}
                          onChange={() => setIsAnonymous(true)}
                          className="mr-3 mt-1"
                        />
                        <div>
                          <span className="font-bold text-yellow-400">NFT ONLY - ANON FRIENDLY</span>
                          <p className="text-sm text-gray-300 mt-1">Stay anonymous, get the NFT! The physical shirt will be raffled off to patriots. TREMENDOUS!</p>
                        </div>
                      </label>
                    </div>
                    
                    {!isAnonymous && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-500 rounded-lg">
                        <h5 className="text-lg font-bold text-blue-400 mb-2">📦 SHIPPING TIMELINE - VERY IMPORTANT!</h5>
                        <div className="text-sm text-blue-200">
                          <p className="mb-2">🚀 <strong>Production begins immediately after mint out!</strong></p>
                          <p className="mb-2">⏱️ <strong>Estimated delivery:</strong> 14-21 business days from mint completion</p>
                          <p className="mb-2">📍 <strong>Shipping updates:</strong> You'll receive tracking info via email</p>
                          <p className="text-xs text-blue-300">
                            * International shipping may take additional time. We'll keep you updated throughout the process!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAnonymous && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={shippingInfo.name}
                          onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Enter your full name"
                        />
    </div>
      
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Enter your email address"
                        />
      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Street Address *</label>
                        <input
                          type="text"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder={shippingInfo.isPoBox ? "Enter your PO Box (e.g., P.O. Box 123)" : "Enter your street address"}
            />
          </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shippingInfo.isPoBox}
                            onChange={(e) => setShippingInfo({...shippingInfo, isPoBox: e.target.checked})}
                            className="mr-2"
                          />
                          <span>This is a PO Box address</span>
                        </label>
                        {shippingInfo.isPoBox && (
                          <p className="text-sm text-gray-400 mt-1">
                            Enter your PO Box in the address field above (e.g., "P.O. Box 123" or "PO Box 456")
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">City *</label>
                          <input
                            type="text"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">State *</label>
                          <input
                            type="text"
                            value={shippingInfo.state}
                            onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            placeholder="State"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Postal Code *</label>
                          <input
                            type="text"
                            value={shippingInfo.postalCode}
                            onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            placeholder="Postal Code"
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <select
                            value={shippingInfo.country === "Other" ? "" : shippingInfo.country}
                            onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                          >
                            <option value="">Select Country</option>
                            <option value="USA">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Australia">Australia</option>
                            <option value="Japan">Japan</option>
                            <option value="South Korea">South Korea</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Norway">Norway</option>
                            <option value="Denmark">Denmark</option>
                            <option value="Finland">Finland</option>
                            <option value="Belgium">Belgium</option>
                            <option value="Austria">Austria</option>
                            <option value="Italy">Italy</option>
                            <option value="Spain">Spain</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Ireland">Ireland</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Hong Kong">Hong Kong</option>
                            <option value="Taiwan">Taiwan</option>
                            <option value="Other">Other</option>
                          </select>
                          {shippingInfo.country === "Other" && (
                            <input
                              type="text"
                              value={shippingInfo.country === "Other" ? "" : shippingInfo.country}
                              onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white mt-2"
                              placeholder="Enter your country name"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Shirt Size *</label>
                        <select
                          value={shippingInfo.size}
                          onChange={(e) => setShippingInfo({...shippingInfo, size: e.target.value})}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          <option value="">Select Size</option>
                          <option value="S">Small</option>
                          <option value="M">Medium</option>
                          <option value="L">Large</option>
                          <option value="XL">X-Large</option>
                          <option value="2XL">2X-Large</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleMint}
                      disabled={isMinting}
                      className="flex-1 text-xl font-bold px-6 py-3 border-2 border-green-500 rounded-lg transition-all duration-300 bg-transparent text-green-500 hover:bg-green-500 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? "MINTING..." : "MINT NFT"}
                    </button>
                    <button
                      onClick={() => setShowMintForm(false)}
                      className="px-6 py-3 border-2 border-gray-500 rounded-lg transition-all duration-300 bg-transparent text-gray-400 hover:bg-gray-500 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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

        {/* Admin Section */}
        {showAdmin && (
          <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Admin Panel</h3>
            <div className="mb-4">
              <p className="text-gray-300">Total Orders: {orders.length}</p>
              <button
                onClick={downloadOrders}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download Orders JSON
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="mb-4 p-4 bg-gray-800 rounded border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400">Order ID: {order.id}</p>
                      <p className="text-sm text-gray-400">Wallet: {order.walletAddress.slice(0, 6)}...{order.walletAddress.slice(-4)}</p>
                      <p className="text-sm text-gray-400">Date: {new Date(order.timestamp).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Anonymous: {order.isAnonymous ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  
                  {!order.isAnonymous && (
                    <div className="mt-2 text-sm">
                      <p><strong>Name:</strong> {order.shippingInfo.name}</p>
                      <p><strong>Email:</strong> {order.shippingInfo.email}</p>
                      <p><strong>Address:</strong> {order.shippingInfo.address} {order.shippingInfo.isPoBox && "(PO Box)"}</p>
                      <p><strong>City:</strong> {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.postalCode}</p>
                      <p><strong>Country:</strong> {order.shippingInfo.country}</p>
                      <p><strong>Size:</strong> {order.shippingInfo.size}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md">
              <h3 className="text-xl font-bold mb-4 text-purple-400">Confirm Mint</h3>
              <div className="text-lg font-bold text-yellow-400 mb-4 text-center">
                MINT PRICE: 0.02 ETH
              </div>
              <p className="mb-4 text-gray-300">
                Are you sure you want to mint your GOUL Shirt NFT?
                {!isAnonymous && " Your shipping information will be saved."}
              </p>
              {/* Show shipping info if not anonymous */}
              {!isAnonymous && (
                <div className="mb-4 p-4 bg-gray-800 rounded text-sm text-gray-200 border border-gray-700">
                  <div><strong>Name:</strong> {shippingInfo.name}</div>
                  <div><strong>Email:</strong> {shippingInfo.email}</div>
                  <div><strong>Address:</strong> {shippingInfo.address} {shippingInfo.isPoBox && "(PO Box)"}</div>
                  <div><strong>City:</strong> {shippingInfo.city}</div>
                  <div><strong>State:</strong> {shippingInfo.state}</div>
                  <div><strong>Postal Code:</strong> {shippingInfo.postalCode}</div>
                  <div><strong>Country:</strong> {shippingInfo.country}</div>
                  <div><strong>Size:</strong> {shippingInfo.size}</div>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  onClick={confirmMint}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm Mint
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
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

        {/* Hidden Chess Game */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          {!showChess ? (
            <div 
              className="fixed bottom-4 cursor-pointer hover:scale-110 transition-all duration-300 z-50"
              style={{ 
                left: `${beetlePosition.x}%`,
                transform: `translateY(${beetlePosition.y}px)`
              }}
              onClick={() => setShowChess(true)}
              title="Click to reveal chess game"
            >
              <span className="text-2xl">🪲</span>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowChess(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Hide Chess
                </button>
              </div>
              <iframe 
                style={{ width: "100%", height: "550px", overflow: "hidden", border: "none" }} 
                src="https://playpager.com/embed/chess/index.html" 
                title="Online Chess Game" 
                scrolling="no"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

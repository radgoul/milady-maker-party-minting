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
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  walletAddress: string;
  shippingInfo: ShippingInfo;
  timestamp: number;
  isAnonymous: boolean;
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
    zipCode: "",
    country: "USA"
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChess, setShowChess] = useState(false);
  const [beetlePosition, setBeetlePosition] = useState({ x: 50, y: 0 });

  // Admin wallet addresses
  const adminWallets = [
    "0x3bdA56Ef07BF6F996F8E3deFDddE6C8109B7e7Be",
    "0x0000000000000000000000000000000000000000" // Placeholder for dev friend
  ];

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem("goulOrders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    // Check if current wallet is admin
    if (accounts?.[0] && adminWallets.includes(accounts[0].toLowerCase())) {
      setShowAdmin(true);
    } else {
      setShowAdmin(false);
    }
  }, [accounts]);

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
          !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
        alert("Please fill in all required shipping information!");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingInfo.email)) {
        alert("Please enter a valid email address!");
        return;
      }

      // Basic ZIP code validation (5 digits)
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(shippingInfo.zipCode)) {
        alert("Please enter a valid 5-digit ZIP code!");
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
          zipCode: "00000",
          country: "USA"
        } : shippingInfo,
        timestamp: Date.now(),
        isAnonymous
      };

      // Save order
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem("goulOrders", JSON.stringify(updatedOrders));

      // Play bomb sound
      const audio = new Audio("/bomb-has-been-planted-sound-effect-cs-go.mp3");
      audio.play().catch(() => console.log("Audio play failed"));

      alert("🎉 NFT Minted Successfully! 🎉");
      
      // Reset form
      setShowMintForm(false);
      setIsAnonymous(false);
      setShippingInfo({
        name: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA"
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
    <div className="min-h-screen bg-black text-white p-8">
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
        <h1 className="text-6xl font-bold mb-8 text-center goosebumps-font text-red-500">
          MAKE AMERICA GOUL AGAIN!!!
        </h1>
        
        <div className="mb-8">
          {isActive ? (
            <div className="text-center">
              <div className="text-green-400 text-xl mb-4">✅ Wallet Connected!</div>
              <div className="text-purple-400 mb-4">
                Address: {accounts?.[0]?.slice(0, 6)}...{accounts?.[0]?.slice(-4)}
              </div>
              
              {!showMintForm ? (
                <button
                  onClick={() => setShowMintForm(true)}
                  className="text-2xl font-bold px-8 py-4 border-2 border-purple-500 rounded-lg transition-all duration-300 goosebumps-font bg-transparent text-purple-500 hover:bg-purple-500 hover:text-white cursor-pointer"
                >
                  MINT SHIRT NFT
                </button>
              ) : (
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">Mint Your GOUL Shirt NFT</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Mint anonymously (no shipping info required)</span>
                    </label>
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
                          placeholder="Enter your street address"
                        />
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
                          <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                          <input
                            type="text"
                            value={shippingInfo.zipCode}
                            onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            placeholder="ZIP Code"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <input
                            type="text"
                            value={shippingInfo.country}
                            onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            placeholder="Country"
                          />
                        </div>
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
                      <p><strong>Address:</strong> {order.shippingInfo.address}</p>
                      <p><strong>City:</strong> {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                      <p><strong>Country:</strong> {order.shippingInfo.country}</p>
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
              <p className="mb-4 text-gray-300">
                Are you sure you want to mint your GOUL Shirt NFT?
                {!isAnonymous && " Your shipping information will be saved."}
              </p>
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

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

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);



  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show minting in progress
    setMintSuccess(false);
    
    try {
      // Simulate actual minting process
      // In real implementation, this would be:
      // const tx = await contract.mint(...);
      // await tx.wait();
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success after "minting" completes
      setMintSuccess(true);
      const bombSound = new Audio("/bomb-has-been-planted-sound-effect-cs-go.mp3");
      bombSound.play();
      
      // Reset after 3 seconds
      setTimeout(() => setMintSuccess(false), 3000);
      
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
          MAKE AMERICA GOUL AGAIN!!! 🎉
        </h1>
        

        
        {mintSuccess && (
          <div className="text-center mb-8 text-green-400 text-2xl font-bold">
            💣 MINT SUCCESSFUL! 💣
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Connect Wallet</h2>
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
            <h2 className="text-2xl mb-4">Mint Shirt NFT</h2>
            <form className="space-y-4" onSubmit={handleMint}>
              <div>
                <label className="block mb-2">Mint Type</label>
                <select 
                  className="border p-2 w-full" 
                  onChange={(e) => {
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

              <div id="identified-fields" className="hidden space-y-4">
                <div>
                  <label className="block mb-2 text-purple-400">Shipping Information</label>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Street Address" 
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City" 
                    className="border border-purple-500 p-3 bg-black text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="State" 
                    className="border border-purple-500 p-3 bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="ZIP Code" 
                    className="border border-purple-500 p-3 bg-black text-white placeholder-gray-400" 
                  />
                  <input 
                    type="text" 
                    placeholder="Country" 
                    className="border border-purple-500 p-3 bg-black text-white placeholder-gray-400" 
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Email (for shipping updates)" 
                    className="border border-purple-500 p-3 w-full bg-black text-white placeholder-gray-400" 
                  />
                </div>
              </div>

              <button type="submit" className="bg-purple-600 px-6 py-3 text-lg font-bold rounded-lg hover:bg-purple-700 transition-colors">
                {mintSuccess ? "Minting..." : "Mint NFT"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

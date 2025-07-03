import { useState } from "react"

export function ConnectButton({
  onClick,
  disabled = false,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}) {
  const [hover, setHover] = useState(false)

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`text-2xl font-bold px-8 py-4 border-2 border-purple-500 rounded-lg transition-all duration-300 goosebumps-font ${
        hover 
          ? 'bg-purple-500 text-white' 
          : 'bg-transparent text-purple-500 hover:bg-purple-500 hover:text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      CONNECT WALLET
    </button>
  )
}

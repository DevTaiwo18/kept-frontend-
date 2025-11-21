function AnalyzingModal({ isOpen, itemCount }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#101010]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F5F0] rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-[#e6c35a]">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[#707072]/20 border-t-[#e6c35a] rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                🤖
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-[#101010] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            AI Analysis in Progress
          </h3>

          <div className="bg-white/60 rounded-lg p-4 mb-4 border-2 border-[#e6c35a]/30">
            <p className="text-base text-[#101010] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Analyzing {itemCount} item{itemCount !== 1 ? 's' : ''}...
            </p>
            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our AI is examining each item to generate accurate descriptions, categories, pricing, dimensions, and smart tags.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-4 border-2 border-[#e6c35a]">
            <p className="text-sm font-bold text-[#101010] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              ⚠️ Please Do Not Close This Tab
            </p>
            <p className="text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
              This process typically takes 30-60 seconds.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#e6c35a] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyzingModal
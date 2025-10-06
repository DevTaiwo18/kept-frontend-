import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      {/* Header */}
      <header className="bg-[#101010] text-[#F8F5F0] py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Kept House Estate Sales
          </h1>
          <p className="text-[#e6c35a] text-lg" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
            The Thoughtful Estate Sales Company
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Color Palette Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            🎨 Color Palette Check
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div style={{ backgroundColor: '#101010' }} className="h-24 rounded-lg shadow-md mb-2"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>Estate Black</p>
            </div>
            <div className="text-center">
              <div style={{ backgroundColor: '#e6c35a' }} className="h-24 rounded-lg shadow-md mb-2"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>Yellow</p>
            </div>
            <div className="text-center">
              <div style={{ backgroundColor: '#F8F5F0' }} className="h-24 rounded-lg shadow-md mb-2 border-2 border-[#707072]"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>White</p>
            </div>
            <div className="text-center">
              <div style={{ backgroundColor: '#1c449e' }} className="h-24 rounded-lg shadow-md mb-2"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>Blue</p>
            </div>
            <div className="text-center">
              <div style={{ backgroundColor: '#707072' }} className="h-24 rounded-lg shadow-md mb-2"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>Gray</p>
            </div>
            <div className="text-center">
              <div style={{ backgroundColor: '#edd88c' }} className="h-24 rounded-lg shadow-md mb-2"></div>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>Soft Yellow</p>
            </div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            ✍️ Typography Check
          </h2>
          <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
            <p className="text-4xl font-bold text-[#101010]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Playfair Display Heading
            </p>
            <p className="text-2xl font-semibold text-[#707072]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Playfair Display Subheading
            </p>
            <p className="text-lg text-[#101010]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
              This is Lato/Inter body text for UI elements and descriptions.
            </p>
            <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
              Smaller UI text in the estate gray color.
            </p>
          </div>
        </section>

        {/* Interactive Component Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            🔘 Interactive Elements
          </h2>
          <div className="bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => setCount(count + 1)}
                className="bg-[#e6c35a] hover:bg-amber-400 text-[#101010] font-semibold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                style={{ fontFamily: 'Inter, Lato, sans-serif' }}
              >
                Primary Action: {count}
              </button>
              
              <div className="flex gap-4 justify-center">
                <button 
                  className="bg-[#101010] hover:bg-gray-800 text-[#F8F5F0] font-medium px-6 py-2 rounded-lg transition-all"
                  style={{ fontFamily: 'Inter, Lato, sans-serif' }}
                >
                  Secondary
                </button>
                <button 
                  className="bg-[#1c449e] hover:bg-blue-700 text-[#F8F5F0] font-medium px-6 py-2 rounded-lg transition-all"
                  style={{ fontFamily: 'Inter, Lato, sans-serif' }}
                >
                  Accent
                </button>
                <button 
                  className="bg-white hover:bg-gray-50 text-[#101010] border-2 border-[#707072] font-medium px-6 py-2 rounded-lg transition-all"
                  style={{ fontFamily: 'Inter, Lato, sans-serif' }}
                >
                  Outline
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#edd88c]/30 rounded-lg border border-[#e6c35a]/40">
              <p className="text-sm text-[#101010]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
                ✅ If you can see all colors and typography correctly, Tailwind is configured properly!
              </p>
            </div>
          </div>
        </section>

        {/* Card Layout Test */}
        <section>
          <h2 className="text-3xl font-semibold text-[#101010] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            📦 Card Layout Test
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Agent', 'Client', 'Shopper'].map((role) => (
              <div
                key={role}
                className="bg-white shadow-md hover:shadow-xl transition-shadow rounded-xl p-6 border border-[#707072]/20"
              >
                <h3 className="text-2xl font-semibold text-[#101010] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {role}
                </h3>
                <p className="text-sm text-[#707072] mb-4" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
                  Testing card layout with Kept House branding and styling.
                </p>
                <button 
                  className="w-full bg-[#e6c35a] hover:bg-amber-400 text-[#101010] font-medium py-2 rounded-lg transition-all"
                  style={{ fontFamily: 'Inter, Lato, sans-serif' }}
                >
                  View Dashboard
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#101010] text-[#F8F5F0] py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, Lato, sans-serif' }}>
            Kept House Estate Sales © 2025 • Tailwind Test Complete
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
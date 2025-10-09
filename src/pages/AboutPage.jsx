import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      
      {/* Page Title */}
      <div className="text-center mb-16">
        <h1 
          className="text-4xl sm:text-5xl font-bold text-[#101010] mb-4" 
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          About Kept House
        </h1>
        <p 
          className="text-xl text-[#707072]" 
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          We help families manage estate transitions with care, efficiency, and respect.
        </p>
      </div>

      {/* Who We Serve */}
      <section className="mb-16">
        <h2 
          className="text-3xl font-bold text-[#101010] mb-8" 
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Who We Serve
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Homeowners', desc: 'Downsizing or relocating' },
            { title: 'Executors', desc: 'Managing estate settlements' },
            { title: 'Families', desc: 'Navigating difficult transitions' },
            { title: 'Real Estate Pros', desc: 'Preparing properties for sale' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-[#707072]/10">
              <h3 
                className="text-lg font-bold text-[#101010] mb-2" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How We Work */}
      <section className="mb-16">
        <h2 
          className="text-3xl font-bold text-[#101010] mb-8" 
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          How We Work
        </h2>
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {[
              { title: 'Walkthrough', desc: 'We assess your items and create a tailored plan.' },
              { title: 'Staging', desc: 'Items are organized and cataloged with AI assistance.' },
              { title: 'Sale', desc: 'Online and in-person sales maximize your return.' },
              { title: 'Donation', desc: 'Unsold items go to trusted partners with tax receipts.' },
              { title: 'Payout', desc: 'Complete property clearing with full financial transparency.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div 
                  className="flex-shrink-0 w-8 h-8 bg-[#e6c35a] text-black rounded-full flex items-center justify-center font-bold text-sm" 
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-[#101010] mb-1" 
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 
          className="text-3xl font-bold text-[#101010] mb-8" 
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Our Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Compassion', 'Transparency', 'Legacy', 'Professionalism'].map((value, i) => (
            <div key={i} className="bg-[#edd88c]/20 p-6 rounded-lg text-center">
              <p 
                className="text-lg font-bold text-[#101010]" 
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Message */}
      <section className="mb-16">
        <div className="bg-[#F8F5F0] p-8 rounded-lg shadow-md">
          <p 
            className="text-lg text-[#101010] italic mb-4" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            "At Kept House, we believe every estate tells a story worth honoring. Our team is dedicated 
            to making transitions as smooth and stress-free as possible."
          </p>
          <p 
            className="text-sm font-semibold text-[#707072]" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            — Greg Pipkins, Co-Founder & CEO
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link 
          to="/contact"
          className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all shadow-md text-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Contact Us
        </Link>
      </section>

    </div>
  )
}

export default AboutPage
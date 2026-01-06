import { Link } from 'react-router-dom'

function PricingPage() {
  return (
    <div className="bg-[#F8F5F0]">

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-[#101010] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Kept House: How It Works
          </h1>
          <p
            className="text-xl text-gray-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Transparent pricing for every stage of your estate transition
          </p>
        </div>
      </section>

      {/* Featured Package */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-[#e6c35a] text-black text-sm font-bold px-4 py-2 transform rotate-0 origin-top-right"
                   style={{ fontFamily: 'Inter, sans-serif' }}>
                POPULAR
              </div>
            </div>

            <div className="bg-[#101010] text-white p-8 text-center">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                WHOLE ESTATE TRANSITION PACKAGES
              </h2>
              <p
                className="text-gray-300 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Includes Estate Transition + Home Clear-out Management
              </p>
              <p
                className="text-gray-400 text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Pricing based on scope of work
              </p>
            </div>

            <div className="p-8 text-center">
              <p
                className="text-4xl sm:text-5xl font-bold text-[#101010] mb-8"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Starting at $1,000 + Revenue Share
              </p>

              <div className="space-y-4 max-w-md mx-auto text-left">
                {['Consultation', 'Inventory', 'Campaign', 'Auction', 'Estate Transition', 'Donation', 'Home Clear-out Management'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-200">
                    <svg className="w-5 h-5 text-[#e6c35a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#101010]" style={{ fontFamily: 'Inter, sans-serif' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  to="/signup"
                  className="inline-block w-full max-w-md px-8 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all text-lg"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Get Started Free
                </Link>
                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  513.609.4731
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Services */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold text-[#101010] mb-12 text-center"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Individual Services
          </h2>

          <div className="space-y-6">
            {[
              {
                title: 'Whole Home Auctions & Estate Transitions',
                price: 'Starting at $500',
                desc: 'Includes: inventory, marketing, in-person and/or online auctions and estate transitions................... PLUS 50/50 SALE SPLIT'
              },
              {
                title: 'Home Clear-out Management',
                price: 'Starting at $250',
                desc: 'Through local, regional and national donation partners, we bring your clear-out costs to an absolute minimum'
              },
              {
                title: 'Estate Liaison',
                price: 'Starting at $500',
                desc: 'Kept House manages your estate while you focus on other important matters. The scope of this work is mainly coordinating with lawyers, realtors, etc. to manage the closing of the estate.'
              },
              {
                title: 'Consignment',
                price: 'Starting at $150',
                desc: 'Kept House is happy to consign smaller lots in case you aren\'t selling your whole home right away'
              },
              {
                title: 'Staging',
                price: 'Starting at $250',
                desc: 'Kept House prepares your home for its estate transition OR real estate sale.'
              }
            ].map((service, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-6 border-b border-gray-200">
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold text-[#101010] mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-[#707072] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {service.desc}
                  </p>
                </div>
                <p
                  className="text-xl font-bold text-[#101010] mt-2 sm:mt-0 sm:ml-8 whitespace-nowrap"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {service.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Percentage Splits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold text-[#101010] mb-4 text-center"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            PERCENTAGE SPLITS
          </h2>
          <p
            className="text-lg text-[#707072] text-center mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Auction & Estate Transition proceed splits are based on how much the sale makes. The more your event sells, the higher percentage you make.
          </p>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {[
              { range: 'Sales events resulting in $50,000 or more', split: '75/25 CLIENT/KH' },
              { range: 'Sales events resulting in $20,000 to $49,999', split: '70/30 CLIENT/KH' },
              { range: 'Sales events resulting in $7,501 to $19,999', split: '60/40 CLIENT/KH' },
              { range: 'Sales events resulting in $7,500 or less', split: '50/50 CLIENT/KH' }
            ].map((tier, i) => (
              <div key={i} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 ${i !== 3 ? 'border-b border-gray-200' : ''}`}>
                <p className="text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {tier.range}
                </p>
                <p
                  className="text-xl font-bold text-[#101010] mt-2 sm:mt-0"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {tier.split}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It Looks Like - Examples */}
      <section className="py-16 px-4 bg-[#101010] text-white">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold mb-4 text-center"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            WHAT IT LOOKS LIKE
          </h2>
          <p
            className="text-lg text-gray-300 text-center mb-12"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Example — Mr. & Mrs. Jones are downsizing from their 4Bed 3Bath home into a senior independent living space.
          </p>

          <div className="space-y-12">
            {/* Scenario 1 */}
            <div className="bg-white/10 rounded-xl p-8">
              <h3
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Scenario 1
              </h3>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                The Jones Family hires Kept House for our <span className="font-bold text-white">Whole Home Auction & Estate Transition</span>.
              </p>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Kept House creates the marketing campaign, promotes and facilitates the execution of the estate transition. The Jones' and Kept House agree to a $2,500 service fee based on the scope of the work, plus a 50/50 split of the proceeds. Kept House requires a $1,000 deposit to begin services, with the remaining balance coming from sale proceeds. The sale makes $4,000.
              </p>
              <p className="text-[#e6c35a] font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Kept House delivers a check to the Jones Family within 10 days for $1,250.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="bg-white/10 rounded-xl p-8">
              <h3
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Scenario 2
              </h3>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                The Jones Family hires Kept House for our <span className="font-bold text-white">Whole Estate Transition Package</span>.
              </p>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Kept House creates the marketing campaign, promotes and facilitates the execution of the estate transition. The Jones' and Kept House agree to a $2,500 service fee based on the scope of the work, plus a 50/50 split of the proceeds. Kept House requires a $1,000 deposit to begin services, with the remaining balance coming from sale proceeds. The sale makes $4,000. After the sale, Kept House manages the clear-out process and reduces clients overall cost of hauling through our donation network.
              </p>
              <p className="text-[#e6c35a] font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                After the clear-out, Kept House either sends a check to the Jones with the remainder, or a balance of what is due.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="bg-white/10 rounded-xl p-8">
              <h3
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Scenario 3
              </h3>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                The Jones Family is giving away most of their possessions and have limited items remaining in the home. They hire Kept House for our <span className="font-bold text-white">Home Clear-out Management</span>.
              </p>
              <p className="text-gray-300 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                The Jones' and Kept House agree to a $500 service fee based on the scope of the work. Kept House requires a $250 deposit to begin services. Kept House manages the clear-out process and reduces clients overall cost of hauling through our donation network.
              </p>
              <p className="text-[#e6c35a] font-bold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                After the clear-out, Kept House sends a balance of what is due.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-[#101010] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="text-lg text-[#707072] mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Create your free profile and we'll reach out to schedule your consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="inline-block px-10 py-4 bg-[#101010] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact Us
            </Link>
          </div>
          <p className="mt-6 text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Or call us directly: <a href="tel:513-609-4731" className="text-[#101010] font-semibold hover:text-[#e6c35a]">513.609.4731</a>
          </p>
        </div>
      </section>

    </div>
  )
}

export default PricingPage

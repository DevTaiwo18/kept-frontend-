import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="bg-[#F8F5F0]">

      {/* Hero Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#101010] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Who is Kept House?
          </h1>
          <p
            className="text-xl sm:text-2xl text-[#101010] italic leading-relaxed"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            "Our core mission is to provide the most thoughtful resource during life's biggest transitions."
          </p>
        </div>
      </section>

      {/* Our Story + Resource Guide */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Story Content */}
            <div>
              <div className="space-y-6 text-lg text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p>
                  Kept House began with Jamie and Greg's desire to support family through a challenging moment. When coronavirus began in March of 2020 and businesses were forced to shut down, these two Walnut Hills High School graduates were living and working in Chicago.
                </p>
                <p>
                  After being laid off, they knew the giant-sized lemon life had just handed them could, and likely would, turn into something refreshing. The moment was ripe. When Jamie's grandfather passed away at the age of 99, and Greg's baby boomer parents began needing that little extra help, the idea for Kept House was born.
                </p>
                <p>
                  Still in its embryo stage, they knew they'd stepped into something unique, something valuable, and something they could use to do what they love the most: help.
                </p>
                <p>
                  The mission became more when they saw the need extended beyond their own families. Jamie and Greg found that their passion had turned into an exciting journey that could provide a timely and invaluable resource to the city of Cincinnati and beyond.
                </p>
                <p>
                  Students of the Ashford Institute of Antiques and alumni of the University of Cincinnati and Southern University (respectively), Jamie and Greg have career backgrounds in the non-profit, public education and service sectors before starting Kept House.
                </p>
              </div>

              {/* Vision Quote */}
              <div className="mt-10 p-6 bg-white rounded-xl border-l-4 border-[#e6c35a]">
                <p
                  className="text-lg text-[#101010] italic"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  "Our vision is to build the most efficient web of support as the premier player in estate transitions and unique shopping."
                </p>
              </div>
            </div>

            {/* Resource Guide Card */}
            <div className="text-center lg:sticky lg:top-8">
              <div className="inline-block border-2 border-[#101010] rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/first page .png"
                  alt="Transition Resource Guide - Estate Transitions: A Thoughtful Guide for Families in Transition"
                  className="w-full max-w-sm mx-auto block"
                />
              </div>
              <p
                className="text-[#101010] font-semibold mt-6 mb-4 text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Transition Resource Guide
              </p>
              <a
                href="/Transition Guide for Seniors and the Professionals Who Serve Them (Booklets (Small)) (1) (1).pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-[#e6c35a] text-black rounded-lg font-semibold hover:bg-[#edd88c] transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Download Guide
              </a>
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
            Schedule a free consultation with our team and let us help you through your transition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block px-10 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Schedule a Call
            </Link>
            <Link
              to="/pricing"
              className="inline-block px-10 py-4 bg-[#101010] text-white rounded-lg font-semibold hover:bg-[#2a2a2a] transition-all text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default AboutPage

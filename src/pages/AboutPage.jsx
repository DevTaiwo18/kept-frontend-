import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="bg-[#F8F5F0]">

      {/* Mission Statement */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span
            className="text-sm font-semibold text-[#e6c35a] uppercase tracking-wider mb-4 block"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Our Mission
          </span>
          <p
            className="text-2xl sm:text-3xl lg:text-4xl text-[#101010] leading-relaxed"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            "At Kept House, we're dedicated to helping families navigate life's transitions with compassion, transparency, and care. Making estate sales simple and stress-free."
          </p>
        </div>
      </section>

      {/* Our Company */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-[#101010] mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Our Company
              </h2>
              <div className="space-y-6 text-lg text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p>
                  Founded to address the challenges families face during major life transitions, Kept House combines compassionate service with modern technology to deliver speed, transparency, and peace of mind.
                </p>
                <p>
                  Our platform has helped dozens of families sell, donate, and clear estates. We handle everything from AI-powered cataloging to coordinating trusted vendors for hauling and donations.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Compassion', desc: 'We treat every family with dignity and care.' },
                { title: 'Transparency', desc: 'Real-time updates and no hidden fees.' },
                { title: 'Simplicity', desc: 'We handle the details so you don\'t have to.' },
                { title: 'Trust', desc: 'Vetted partners and secure transactions.' }
              ].map((value, i) => (
                <div key={i} className="bg-white p-6 rounded-xl">
                  <h3
                    className="text-lg font-bold text-[#101010] mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-sm text-[#707072]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-[#101010] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Let's Talk
          </h2>
          <p
            className="text-lg text-[#707072] mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ready to get started? Schedule a free consultation with our team.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-[#e6c35a] text-black rounded-lg font-bold hover:bg-[#edd88c] transition-all text-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Schedule a Call
          </Link>
        </div>
      </section>

    </div>
  )
}

export default AboutPage

import { useState } from 'react'
import { Link } from 'react-router-dom'

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0) // First item open by default

  const faqs = [
    {
      question: 'What is an Estate Transition?',
      answer: 'An estate transition is a sale or auction to dispose of a substantial portion of the materials owned by a person.'
    },
    {
      question: "Aren't Estate Transitions for the wealthy?",
      answer: 'An estate transition is for anyone in transition who wants to get the best financial value from the things they no longer want to keep.'
    },
    {
      question: 'How does the process work?',
      answer: 'The Kept House team meets with potential clients to listen to the client\'s needs, review the best service options and build a plan around the selected services.'
    },
    {
      question: 'Will Kept House meet with others involved with the estate such as attorneys, accountants, realtors, and family members?',
      answer: 'We recognize there are many stakeholders involved during life\'s transitions. We encourage an internal meeting amongst family members, attorneys, etc. before meeting with Kept House to ensure the most efficient process.'
    },
    {
      question: 'What about all the junk, should I throw anything away?',
      answer: 'WE ASK THAT YOU DO NOT THROW ANYTHING AWAY UNTIL YOU HAVE MET WITH US!'
    },
    {
      question: 'What about the items my family wishes to keep?',
      answer: 'Items that your family wishes to keep should be removed from the home prior to the sale, if possible. If this is not possible, we will designate a room to hold these items and it will be kept secured and off limits to customers. We will also clearly mark any larger items "Not For Sale" before setup begins.\n\nAs we go through boxes, closets, drawers, etc., we may discover personal items that might be valuable to the family. We will notify you of these items and consult with you before selling them. If you are unsure whether to keep an item, we advise that you keep it — it can always be sold later.'
    },
    {
      question: 'How do you price the items and what types of items can be sold?',
      answer: 'Kept House performs extensive research to obtain fair market value on all items up for sale. Items that can be sold include, but are not limited to: art, antiques, collectibles, furniture, jewelry, home décor, and general household goods.\n\nIf needed, we consult with specialists to ensure accuracy for significant items. We sell anything in the home that is legal to sell.'
    },
    {
      question: 'How long does it take to set up an estate transition?',
      answer: 'For effective advertising and setup, we prefer a four-week lead time. The actual setup can last up to 4 days, depending on the size of the home.'
    },
    {
      question: 'How long does the actual sale last?',
      answer: 'Sales generally take place over a two- to three-day period, starting in the morning until early afternoon. For very large sales, we may add an additional day or multiple weekends.'
    },
    {
      question: 'How many buyers will be in the house at once?',
      answer: 'Estate transitions are open to the public. We limit the number of people inside the house to what our staff can manage.'
    },
    {
      question: 'What fees and/or costs are involved with having an estate transition?',
      answer: 'There is a $1,000 deposit required to receive any of our sale or auction services. We ask clients to refer to our pricing page for details and examples.'
    },
    {
      question: 'What happens to the unsold items?',
      answer: 'Kept House maintains relationships with community partners for donation of certain items. We also provide trash services (for a fee). Anything left beyond that is up to the executor of the estate.'
    },
    {
      question: 'Do you have security?',
      answer: 'Kept House works with local security companies for high-end sales. We will call police for theft or disruptive behavior. On sale days, Kept House team members will monitor spaces used during the sale.'
    },
    {
      question: 'Can clients attend the sale?',
      answer: 'We do not recommend client attendance. Estate transitions can be very emotional, and seeing buyers go through family items can be unsettling. Buyers feel more comfortable negotiating when clients are not on-site.\n\nKept House can provide daily sale reports by email if desired. We handle the process so you can relax.'
    },
    {
      question: 'How and when will I receive the profits from the estate transition?',
      answer: 'After the sale, we provide a synopsis of the sale and a check for the proceeds (minus commission and any requested services). This is provided as a comprehensive package within 14 days after the sale concludes.'
    },
    {
      question: 'What is your refund, return, and cancellation policy?',
      answer: 'Returns and Refunds: Due to the unique, often one-of-a-kind nature of estate items, all sales are final. Buyers should review item descriptions, photographs, and any available condition reports. If an item is significantly not as described, buyers may contact Kept House within 48 hours of receipt. We will review claims individually and may offer a refund, store credit, or replacement at our discretion.\n\nCancellations: Because estate transitions are fast-paced, we cannot accommodate cancellations once a bid or purchase has been placed.\n\nLost in Transit: If an item cannot be delivered or is lost in transit, Kept House will work to resolve the issue and may offer a refund, store credit, or replacement depending on circumstances.'
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-[#F8F5F0] min-h-screen">

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="inline-block px-4 py-1 bg-[#e6c35a]/20 text-[#101010] rounded-full text-sm font-semibold mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Got Questions?
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#101010] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Frequently Asked Questions
          </h1>
          <p
            className="text-lg text-[#707072] max-w-xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Everything you need to know about our estate transition services. Can't find what you're looking for? Contact us directly.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl border-2 transition-all duration-200 ${
                    isOpen ? 'border-[#e6c35a] shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  >
                    <span
                      className={`text-base sm:text-lg font-semibold transition-colors ${
                        isOpen ? 'text-[#101010]' : 'text-[#101010]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isOpen ? 'bg-[#e6c35a] rotate-180' : 'bg-[#F8F5F0]'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-colors ${isOpen ? 'text-black' : 'text-[#707072]'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5">
                      <div className="pt-2 border-t border-gray-100">
                        <p
                          className="text-[#707072] text-base leading-relaxed whitespace-pre-line pt-4"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#101010] rounded-2xl p-8 sm:p-12 text-center">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Still have questions?
            </h2>
            <p
              className="text-gray-400 mb-8 max-w-md mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              We're here to help. Reach out and our team will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#e6c35a] text-black rounded-xl font-bold hover:bg-[#edd88c] transition-all text-base"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
              <a
                href="tel:513-609-4731"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all text-base"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (513) 609-4731
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default FAQPage

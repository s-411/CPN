import React from 'react'

export function DesignSystemTest() {
  return (
    <div className="p-8 space-y-8 bg-cpn-dark min-h-screen">
      {/* Typography Test */}
      <section>
        <h1 className="text-4xl font-bold mb-4">CPN Design System Test</h1>
        <h2 className="text-3xl font-bold mb-3 text-cpn-yellow">Heading Level 2</h2>
        <h3 className="text-2xl font-bold mb-2">Heading Level 3</h3>
        <p className="text-cpn-white mb-2">
          This is body text using ES Klarheit Grotesk font. It should be clean and readable.
        </p>
        <p className="text-cpn-gray">
          This is secondary text in the brand gray color (#ABABAB).
        </p>
      </section>

      {/* Color Palette Test */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cpn-yellow">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cpn-yellow p-4 rounded-lg">
            <p className="text-cpn-dark font-semibold">#f2f661</p>
            <p className="text-cpn-dark text-sm">CPN Yellow</p>
          </div>
          <div className="bg-cpn-dark border border-cpn-gray p-4 rounded-lg">
            <p className="text-cpn-white font-semibold">#1f1f1f</p>
            <p className="text-cpn-gray text-sm">CPN Dark</p>
          </div>
          <div className="bg-cpn-white p-4 rounded-lg">
            <p className="text-cpn-dark font-semibold">#ffffff</p>
            <p className="text-cpn-dark text-sm">CPN White</p>
          </div>
          <div className="bg-cpn-gray p-4 rounded-lg">
            <p className="text-cpn-dark font-semibold">#ABABAB</p>
            <p className="text-cpn-dark text-sm">CPN Gray</p>
          </div>
        </div>
      </section>

      {/* Button Test */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cpn-yellow">Buttons</h2>
        <div className="space-x-4 space-y-2">
          <button className="btn-cpn">
            Primary CPN Button
          </button>
          <button className="bg-cpn-dark border border-cpn-yellow text-cpn-yellow py-3 px-6 rounded-cpn hover:bg-cpn-yellow hover:text-cpn-dark transition-all duration-200">
            Secondary Button
          </button>
          <button className="bg-transparent border border-cpn-gray text-cpn-gray py-3 px-6 rounded-cpn hover:border-cpn-white hover:text-cpn-white transition-all duration-200">
            Outline Button
          </button>
        </div>
      </section>

      {/* Form Elements Test */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cpn-yellow">Form Elements</h2>
        <div className="max-w-md space-y-4">
          <input
            type="text"
            placeholder="Enter your text here..."
            className="w-full p-3 rounded-lg border border-cpn-gray bg-cpn-dark text-cpn-white placeholder-cpn-gray focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none"
          />
          <textarea
            placeholder="Enter your message..."
            rows={4}
            className="w-full p-3 rounded-lg border border-cpn-gray bg-cpn-dark text-cpn-white placeholder-cpn-gray focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none resize-none"
          />
          <select className="w-full p-3 rounded-lg border border-cpn-gray bg-cpn-dark text-cpn-white focus:ring-2 focus:ring-cpn-yellow focus:border-cpn-yellow outline-none">
            <option value="">Select an option</option>
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </select>
        </div>
      </section>

      {/* Animation Test */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cpn-yellow">Animations</h2>
        <div className="space-y-4">
          <div className="bg-cpn-dark border border-cpn-gray p-4 rounded-lg animate-fade-in">
            <p className="text-cpn-white">This element fades in</p>
          </div>
          <div className="bg-cpn-dark border border-cpn-gray p-4 rounded-lg animate-slide-up">
            <p className="text-cpn-white">This element slides up</p>
          </div>
        </div>
      </section>

      {/* Typography Hierarchy Test */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cpn-yellow">Typography Hierarchy</h2>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">H1: National 2 Condensed Bold</h1>
          <h2 className="text-3xl font-bold">H2: National 2 Condensed Bold</h2>
          <h3 className="text-2xl font-bold">H3: National 2 Condensed Bold</h3>
          <h4 className="text-xl font-bold">H4: National 2 Condensed Bold</h4>
          <h5 className="text-lg font-bold">H5: National 2 Condensed Bold</h5>
          <h6 className="text-base font-bold">H6: National 2 Condensed Bold</h6>
          <p className="text-base">Body text: ES Klarheit Grotesk Regular</p>
          <p className="text-sm text-cpn-gray">Small text: ES Klarheit Grotesk Regular</p>
        </div>
      </section>
    </div>
  )
}
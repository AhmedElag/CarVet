export function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-900">
            AI-powered used car buying assistant
          </p>

          <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Don&apos;t buy blind.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            CarVet helps used car buyers spot red flags, understand known
            model-specific issues, and make smarter decisions before viewing,
            negotiating, or buying.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-950">
              Start a Buyer Review
            </button>

            <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              View Services
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-400">Sample CarVet Report</p>

            <h2 className="mt-4 text-2xl font-semibold">
              2012 BMW 335i xDrive
            </h2>

            <div className="mt-6 rounded-xl bg-white/10 p-4">
              <p className="text-sm text-slate-300">Risk Score</p>
              <p className="mt-2 text-4xl font-bold">7.8 / 10</p>
              <p className="mt-2 text-sm text-slate-300">
                Proceed with caution
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>• Inspect OFHG for oil leaks near the housing</li>
              <li>• Check valve cover and PCV system</li>
              <li>• Scan for VANOS, misfire, and fuel trim codes</li>
              <li>• Review water pump and charge pipe history</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
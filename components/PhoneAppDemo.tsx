"use client";

import { useEffect, useMemo, useState } from 'react';
import Link, { assetPath } from '@/demo/navigation';
import { ArrowLeft, ArrowRight, Bookmark, Car, Check, CheckCircle2, ChevronRight, ClipboardCheck, Download, Gauge, Home, Pause, Play, Plus, Radio, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { driveScenarios, sampleClock, type DriveScenario } from '@/lib/test-drive-demo';
import '@/demo/phone-app.css';

type Tab = 'home' | 'discover' | 'garage' | 'scanner';
type Status = 'saved' | 'viewing' | 'checked' | 'passed';
type Listing = { id: string; name: string; year: number; body: string; fuel: 'Gas' | 'Electric'; price: number; km: number; accent: string; tag: string; question: string };
type SavedCar = { id: string; status: Status; note: string; scan?: { scenario: string; savedAt: string } };
type Garage = { version: 1; cars: SavedCar[] };
const storageKey = 'carvet.phone-demo.garage.v1';
const listings: Listing[] = [
  { id: 'phone-mazda', name: 'Mazda CX-5', year: 2023, body: 'SUV', fuel: 'Gas', price: 26900, km: 59000, accent: 'sage', tag: 'Room for your next chapter', question: 'Ask for dated service invoices and arrange an independent inspection.' },
  { id: 'phone-fit', name: 'Honda Fit', year: 2020, body: 'Hatchback', fuel: 'Gas', price: 18900, km: 82000, accent: 'sand', tag: 'A simpler city commute', question: 'Confirm the service history and check tire condition at the viewing.' },
  { id: 'phone-bolt', name: 'Chevrolet Bolt', year: 2020, body: 'Hatchback', fuel: 'Electric', price: 22900, km: 67000, accent: 'blue', tag: 'An electric change', question: 'Request battery health evidence and demonstrate charging with a qualified EV technician.' },
  { id: 'phone-crv', name: 'Honda CR-V', year: 2022, body: 'SUV', fuel: 'Gas', price: 28500, km: 72000, accent: 'sand', tag: 'Space for the everyday', question: 'Confirm the history report, maintenance records and total price before deciding.' },
  { id: 'phone-civic', name: 'Honda Civic', year: 2021, body: 'Sedan', fuel: 'Gas', price: 21900, km: 68000, accent: 'blue', tag: 'For the daily miles', question: 'Ask about recent repairs and arrange a cold-start viewing.' },
  { id: 'phone-tucson', name: 'Hyundai Tucson', year: 2020, body: 'SUV', fuel: 'Gas', price: 24900, km: 76000, accent: 'sage', tag: 'A little more possibility', question: 'Review the service records, seller answers and independent inspection findings.' },
];
const statusLabels: Record<Status, string> = { saved: 'Looking at', viewing: 'Viewing next', checked: 'Checked', passed: 'Passed on' };
const seedCars: SavedCar[] = [
  { id: 'phone-mazda', status: 'viewing', note: 'Ask for the dated service invoices before the viewing.' },
  { id: 'phone-fit', status: 'saved', note: '' },
  { id: 'phone-bolt', status: 'checked', note: 'Battery health evidence is still missing.', scan: { scenario: 'electric', savedAt: 'Sample session' } },
];
const money = (n: number) => `C$${n.toLocaleString('en-CA')}`;
const name = (v: Listing) => `${v.year} ${v.name}`;
const km = (n: number) => `${n.toLocaleString('en-CA')} km`;
function freshGarage(): Garage { return { version: 1, cars: seedCars.map(car => ({ ...car, scan: car.scan ? { ...car.scan } : undefined })) }; }
function readGarage(): Garage {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (value && typeof value === 'object' && 'version' in value && value.version === 1 && 'cars' in value && Array.isArray(value.cars)) {
      const cars = value.cars.filter((car): car is SavedCar => Boolean(car) && typeof car === 'object' && listings.some(v => v.id === car.id) && ['saved', 'viewing', 'checked', 'passed'].includes(car.status) && typeof car.note === 'string');
      return { version: 1, cars: [...new Map(cars.map(car => [car.id, car])).values()] };
    }
  } catch { /* The demo still works if browser storage is unavailable. */ }
  return freshGarage();
}

function VehicleArt({ vehicle, compact = false }: { vehicle: Listing; compact?: boolean }) {
  return <div className={`pa-vehicle-art pa-${vehicle.accent} ${compact ? 'pa-art-small' : ''}`} aria-hidden="true"><span className="pa-art-orbit" /><Car strokeWidth={1.05} /><span className="pa-art-label">{vehicle.fuel === 'Electric' ? 'ELECTRIC' : 'YOUR NEXT POSSIBILITY'}</span></div>;
}

export function PhoneAppDemo() {
  const [tab, setTab] = useState<Tab>('home');
  const [garage, setGarage] = useState<Garage>(freshGarage);
  const [loaded, setLoaded] = useState(false);
  const [storageNote, setStorageNote] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [garageFilter, setGarageFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [fuel, setFuel] = useState('All');
  const [budget, setBudget] = useState('40000');
  const [showFilters, setShowFilters] = useState(false);
  const [scanCarId, setScanCarId] = useState('phone-mazda');
  const [scenarioId, setScenarioId] = useState('everyday');
  const [scanStep, setScanStep] = useState<'kit' | 'setup' | 'replay' | 'review'>('kit');
  const [parked, setParked] = useState(false);
  const [permission, setPermission] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [supportTopic, setSupportTopic] = useState('');
  const scenario: DriveScenario = driveScenarios.find(s => s.id === scenarioId) || driveScenarios[0];
  const frame = scenario.frames[frameIndex] || scenario.frames[0];
  const savedCars = garage.cars.map(saved => ({ saved, vehicle: listings.find(car => car.id === saved.id)! }));
  const currentCar = listings.find(car => car.id === selected);
  const currentSaved = garage.cars.find(car => car.id === selected);
  const scanCar = listings.find(car => car.id === scanCarId);
  const activeCars = savedCars.filter(({ saved }) => saved.status !== 'passed');
  const checkedCount = garage.cars.filter(car => car.status === 'checked').length;
  const discover = useMemo(() => listings.filter(car => `${name(car)} ${car.body}`.toLowerCase().includes(query.toLowerCase()) && (fuel === 'All' || car.fuel === fuel) && car.price <= (Number(budget) || 0)).sort((a, b) => a.price - b.price), [query, fuel, budget]);

  useEffect(() => { setGarage(readGarage()); setLoaded(true); }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(garage)); setStorageNote('Your demo garage saves on this browser.'); }
    catch { setStorageNote('Storage is unavailable here. Your demo changes will last until this page closes.'); }
  }, [garage, loaded]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setFrameIndex(index => Math.min(index + 1, scenario.frames.length - 1)), 950);
    return () => clearInterval(timer);
  }, [playing, scenario.id, scenario.frames.length]);
  useEffect(() => { if (playing && frameIndex >= scenario.frames.length - 1) setPlaying(false); }, [playing, frameIndex, scenario.frames.length]);
  useEffect(() => { setFrameIndex(0); setPlaying(false); }, [scenarioId]);
  useEffect(() => { if (tab !== 'scanner' || scanStep !== 'replay') setPlaying(false); }, [tab, scanStep]);

  function openTab(next: Tab) { setTab(next); setSelected(null); setNotice(''); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function openCar(id: string) { setSelected(id); setNotice(''); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function updateCar(id: string, update: Partial<SavedCar>) { setGarage(old => ({ version: 1, cars: old.cars.some(car => car.id === id) ? old.cars.map(car => car.id === id ? { ...car, ...update } : car) : [...old.cars, { id, status: 'saved', note: '', ...update }] })); }
  function saveCar(id: string) { updateCar(id, { status: 'saved' }); setNotice('Added to My cars. Keep your notes and next steps together.'); }
  function startForCar(id: string) { setScanCarId(id); const vehicle = listings.find(car => car.id === id); setScenarioId(vehicle?.fuel === 'Electric' ? 'electric' : 'everyday'); setScanStep('kit'); setParked(false); setPermission(false); openTab('scanner'); }
  function attachSample() {
    if (!scanCar || !garage.cars.some(car => car.id === scanCarId)) { setNotice('Save a car to My cars before attaching a sample.'); return; }
    updateCar(scanCarId, { status: 'checked', scan: { scenario: scenario.id, savedAt: new Date().toISOString() } });
    setNotice(`Sample session attached to ${scanCar.name}. Marked checked in this demo; this is not a real vehicle assessment.`);
  }
  function exportGarage() {
    const content = { sample: true, source: 'CarVet phone app browser demo. All cars, statuses and diagnostic sessions are illustrative.', garage: garage.cars.map(saved => ({ ...saved, vehicle: listings.find(car => car.id === saved.id) })), realScannerConnected: false };
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'CarVet-Phone-Demo-Garage.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Your sample garage is ready to download.');
  }

  function CarRow({ vehicle, saved }: { vehicle: Listing; saved?: SavedCar }) {
    return <button type="button" className="pa-car-row" onClick={() => openCar(vehicle.id)}><VehicleArt vehicle={vehicle} compact /><span className="pa-car-row-copy"><small>{saved ? statusLabels[saved.status] : vehicle.tag}</small><strong>{name(vehicle)}</strong><span>{money(vehicle.price)} <i>·</i> {km(vehicle.km)}</span>{saved?.scan && <em><CheckCircle2 size={12} /> Sample session attached</em>}</span><ChevronRight size={17} /></button>;
  }

  return <main className="phone-demo-page">
    <div className="pa-desktop-caption"><Link href="/" className="pa-back-link"><ArrowLeft size={15} />Back to CarVet</Link><span>PHONE APP / INTERACTIVE PREVIEW</span><h1>Your search.<br /><em>In your pocket.</em></h1><p>A separate app concept for the cars you discover, the ones you check, and the evidence you keep.</p><div className="pa-caption-note"><ShieldCheck size={19} /><p>Try every screen. Sample vehicles and recorded readings keep the story clear while the real scanner app is still to be built.</p></div></div>
    <div className="pa-shell">
      <header className="pa-header"><Link href="/" className="pa-brand" aria-label="Back to CarVet website"><img src={assetPath('/CarVet/Logo.png')} alt="CarVet" /></Link><span className="pa-demo-badge"><span />App demo</span><Link href="/" className="pa-exit" aria-label="Back to website"><X size={18} /></Link></header>
      <div className="pa-screen">
        {currentCar ? <>
          <button type="button" className="pa-back-link pa-detail-back" onClick={() => setSelected(null)}><ArrowLeft size={16} />Back to {tab === 'discover' ? 'Discover' : tab === 'home' ? 'My search' : 'My cars'}</button>
          <VehicleArt vehicle={currentCar} />
          <div className="pa-detail-heading"><span className="pa-kicker">SAMPLE VEHICLE / YOUR NOTES</span><h1>{name(currentCar)}</h1><p>{money(currentCar.price)} <i>·</i> {km(currentCar.km)} <i>·</i> {currentCar.fuel}</p></div>
          {!currentSaved ? <button type="button" className="pa-button" onClick={() => saveCar(currentCar.id)}><Plus size={17} />Save to My cars</button> : <section className="pa-card"><div className="pa-section-heading"><h2>Where are you with this car?</h2><Bookmark size={17} /></div><div className="pa-status-grid">{(Object.keys(statusLabels) as Status[]).map(status => <button type="button" key={status} aria-pressed={currentSaved.status === status} className={currentSaved.status === status ? 'selected' : ''} onClick={() => updateCar(currentCar.id, { status })}>{currentSaved.status === status && <Check size={13} />}{statusLabels[status]}</button>)}</div><label className="pa-label" htmlFor="phone-car-note">Your viewing notes</label><textarea id="phone-car-note" rows={4} value={currentSaved.note} placeholder="Questions, records, things to remember…" onChange={event => updateCar(currentCar.id, { note: event.target.value })} /><p className="pa-small">Notes save on this browser. Use fictional details.</p></section>}
          <section className="pa-card pa-soft-card"><span className="pa-kicker">ONE USEFUL NEXT QUESTION</span><h2>Close the evidence gap.</h2><p>{currentCar.question}</p></section>
          <section className="pa-card"><div className="pa-section-heading"><h2>Test-drive evidence</h2><Radio size={18} /></div>{currentSaved?.scan ? <><div className="pa-attached"><CheckCircle2 size={18} /><div><strong>Sample recording attached</strong><span>{driveScenarios.find(item => item.id === currentSaved.scan?.scenario)?.title || 'Recorded sample'}</span></div></div><p className="pa-small">This preloaded recording was attached for the demo. It was not collected from this car. “Checked” is a workflow label, not a condition verdict.</p></> : <p>No sample session attached yet. Explore how a future scanner recording could become part of this car’s story.</p>}<button type="button" className="pa-button pa-button-outline" onClick={() => startForCar(currentCar.id)}><Gauge size={17} />Open scanner demo<ArrowRight size={16} /></button></section>
        </> : tab === 'home' ? <>
          <div className="pa-welcome"><span className="pa-kicker">YOUR NEXT CHAPTER</span><h1>A little clarity.<br /><em>Every car, together.</em></h1><p>Discover possibilities. Keep your questions. Know what to check next.</p></div>
          <div className="pa-home-hero"><img src={assetPath('/images/road-ahead.webp')} alt="A silver crossover on a quiet countryside road" /><div><span>THE ROAD AHEAD</span><h2>One place for<br />the whole search.</h2><button type="button" onClick={() => openTab('discover')}>Find a sample car<ArrowRight size={16} /></button></div></div>
          <div className="pa-stats"><button type="button" onClick={() => { setGarageFilter('all'); openTab('garage'); }}><strong>{activeCars.length.toString().padStart(2, '0')}</strong><span>Cars in your search<ArrowRight size={13} /></span></button><button type="button" onClick={() => { setGarageFilter('checked'); openTab('garage'); }}><strong>{checkedCount.toString().padStart(2, '0')}</strong><span>Cars you’ve checked<ArrowRight size={13} /></span></button></div>
          <section className="pa-section"><div className="pa-section-heading"><h2>Pick up the story.</h2><button type="button" className="pa-text-button" onClick={() => { setGarageFilter('all'); openTab('garage'); }}>My cars<ChevronRight size={14} /></button></div>{activeCars.length ? activeCars.slice(0, 2).map(({ saved, vehicle }) => <CarRow key={vehicle.id} vehicle={vehicle} saved={saved} />) : <p className="pa-small">Your next possibility starts in Discover. Save a sample car to keep it here.</p>}</section>
          <button type="button" className="pa-scanner-invitation" onClick={() => openTab('scanner')}><span className="pa-icon-box"><Radio size={23} /></span><span><small>THE SCANNER YOU KEEP</small><strong>A clearer test drive.</strong><span>Try a recorded session.</span></span><ChevronRight size={18} /></button>
          <div className="pa-demo-note"><Sparkles size={16} /><p>This is a working phone app concept. All listings and reviews are samples; no live marketplace, scanner, shipment or advisor is connected.</p></div>
        </> : tab === 'discover' ? <>
          <div className="pa-page-heading"><span className="pa-kicker">DISCOVER / SAMPLE INVENTORY</span><h1>Find your<br /><em>next possibility.</em></h1><p>Try your search with six illustrative cars.</p></div>
          <div className="pa-search"><Search size={18} /><input aria-label="Search sample cars" placeholder="Make, model, or body style" value={query} onChange={event => setQuery(event.target.value)} /><button type="button" aria-label="Show search filters" aria-expanded={showFilters} onClick={() => setShowFilters(value => !value)}><SlidersHorizontal size={18} /></button></div>
          {showFilters && <section className="pa-card pa-filter-panel"><label className="pa-label" htmlFor="phone-budget">Maximum sample price · CAD</label><input id="phone-budget" type="number" min="0" step="1000" value={budget} onChange={event => setBudget(event.target.value)} /><label className="pa-label" htmlFor="phone-fuel">Powertrain</label><select id="phone-fuel" value={fuel} onChange={event => setFuel(event.target.value)}><option>All</option><option>Gas</option><option>Electric</option></select><button type="button" className="pa-text-button" onClick={() => { setQuery(''); setBudget('40000'); setFuel('All'); }}>Reset filters<RotateCcw size={14} /></button></section>}
          <div className="pa-results-count">{discover.length} sample {discover.length === 1 ? 'car' : 'cars'} <span>Lowest asking price first</span></div>
          {discover.map(vehicle => <article key={vehicle.id} className="pa-listing-card"><button type="button" className="pa-listing-open" onClick={() => openCar(vehicle.id)} aria-label={`View ${name(vehicle)}`}><VehicleArt vehicle={vehicle} /><div className="pa-listing-copy"><span className="pa-kicker">{vehicle.body} / {vehicle.fuel}</span><h2>{name(vehicle)}</h2><p>{km(vehicle.km)} <i>·</i> Sample listing</p><strong>{money(vehicle.price)}</strong></div></button><div className="pa-listing-actions"><button type="button" onClick={() => openCar(vehicle.id)}>View details<ArrowRight size={15} /></button><button type="button" className={garage.cars.some(car => car.id === vehicle.id) ? 'is-saved' : ''} onClick={() => { if (garage.cars.some(car => car.id === vehicle.id)) { setGarageFilter('all'); openTab('garage'); openCar(vehicle.id); } else saveCar(vehicle.id); }}><Bookmark size={16} />{garage.cars.some(car => car.id === vehicle.id) ? 'In My cars' : 'Save car'}</button></div></article>)}
          {!discover.length && <div className="pa-empty"><Search size={26} /><h2>A fresh search?</h2><p>No sample car meets these filters.</p><button type="button" className="pa-button" onClick={() => { setQuery(''); setBudget('40000'); setFuel('All'); }}>Reset sample search</button></div>}
          <p className="pa-small">Synthetic inventory, before taxes and fees. These are not live listings or verified vehicle histories.</p>
        </> : tab === 'garage' ? <>
          <div className="pa-page-heading"><span className="pa-kicker">MY CARS / YOUR SEARCH, TOGETHER</span><h1>The possibilities.<br /><em>And the progress.</em></h1><p>Keep the cars you’re looking at, the ones you’ve checked, and the questions still open.</p></div>
          <div className="pa-filter-strip" aria-label="Filter my cars">{([{ value: 'all', label: 'All cars' }, { value: 'saved', label: 'Looking at' }, { value: 'viewing', label: 'Viewing' }, { value: 'checked', label: 'Checked' }, { value: 'passed', label: 'Passed' }] as const).map(filter => <button type="button" key={filter.value} aria-pressed={garageFilter === filter.value} className={garageFilter === filter.value ? 'selected' : ''} onClick={() => setGarageFilter(filter.value)}>{filter.label}</button>)}</div>
          <div className="pa-garage-list">{savedCars.filter(({ saved }) => garageFilter === 'all' || saved.status === garageFilter).map(({ saved, vehicle }) => <CarRow key={vehicle.id} vehicle={vehicle} saved={saved} />)}</div>
          {!savedCars.some(({ saved }) => garageFilter === 'all' || saved.status === garageFilter) && <div className="pa-empty"><Car size={28} /><h2>No cars here yet.</h2><p>Discover a sample car or change this filter.</p><button type="button" className="pa-button" onClick={() => openTab('discover')}>Discover sample cars<ArrowRight size={15} /></button></div>}
          <section className="pa-card pa-soft-card"><div className="pa-section-heading"><h2>The useful distinction.</h2><ClipboardCheck size={18} /></div><p>“Checked” means you explored the sample workflow. It does not verify the condition of a real car. Open a car to keep its evidence gaps visible.</p></section>
          <div className="pa-garage-tools"><button type="button" onClick={exportGarage}><Download size={16} />Download sample garage</button><button type="button" onClick={() => { setGarage(freshGarage()); setGarageFilter('all'); setNotice('Sample garage restored. Your local demo edits were reset.'); }}><RotateCcw size={15} />Restore sample cars</button></div><p className="pa-small">{storageNote} No account or shared advisor storage is connected.</p>
        </> : <>
          <div className="pa-page-heading"><span className="pa-kicker">SCANNER / THE TEST-DRIVE COMPANION</span><h1>A drive has<br /><em>a story, too.</em></h1><p>A scanner you keep. Supported readings in a future app. A clearer conversation afterwards.</p></div>
          <div className="pa-connection"><span /><strong>Recorded demo</strong><span>No device connected</span></div>
          <section className="pa-card pa-scan-car"><label className="pa-label" htmlFor="phone-scan-car">Keep the sample with a car</label><select id="phone-scan-car" value={scanCarId} onChange={event => { setScanCarId(event.target.value); setScenarioId(listings.find(item => item.id === event.target.value)?.fuel === 'Electric' ? 'electric' : 'everyday'); }}>{savedCars.map(({ vehicle }) => <option key={vehicle.id} value={vehicle.id}>{name(vehicle)}</option>)}</select><p className="pa-small">The recording is preloaded, not collected from the selected car.</p></section>
          {scanStep === 'kit' ? <>
            <div className="pa-scanner-card"><div className="pa-scanner-device" aria-hidden="true"><Radio size={38} strokeWidth={1.2} /><span>CarVet</span><i /><i /><i /></div><span className="pa-kicker">THE KEEP-FOREVER KIT / PLANNED</span><h2>Sent to you.<br /><em>Yours for the next car.</em></h2><p>Selected packages would include a compatible OBD scanner. You keep the hardware after your search.</p><div className="pa-kit-steps"><span><Check size={13} />Confirm compatibility</span><span><Check size={13} />Set up while parked</span><span><Check size={13} />Review after the drive</span></div></div>
            <button type="button" className="pa-button" onClick={() => setScanStep('setup')}>Try a sample session<ArrowRight size={17} /></button><p className="pa-small">Shipping, pairing and vehicle logging are future features. This preview does not connect to Bluetooth or read any ECU/DME.</p>
          </> : scanStep === 'setup' ? <>
            <section className="pa-card"><span className="pa-kicker">01 / A CALM START</span><h2>Before the car moves.</h2><p>The future app would confirm the car and adapter support, then capture supported data automatically with the phone secured.</p><label className="pa-label" htmlFor="phone-recording">Choose a sample recording</label><select id="phone-recording" value={scenarioId} onChange={event => setScenarioId(event.target.value)}>{driveScenarios.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select><label className="pa-check"><input type="checkbox" checked={parked} onChange={event => setParked(event.target.checked)} /><span>The car is parked for setup.<small>Demo check</small></span></label><label className="pa-check"><input type="checkbox" checked={permission} onChange={event => setPermission(event.target.checked)} /><span>The seller has agreed to a scanner check.<small>Demo check</small></span></label></section><button type="button" className="pa-button" disabled={!parked || !permission} onClick={() => { setFrameIndex(0); setScanStep('replay'); }}>Open recorded sample<Play size={16} /></button><button type="button" className="pa-text-button pa-center" onClick={() => setScanStep('kit')}><ArrowLeft size={15} />Back to the kit</button>
          </> : scanStep === 'replay' ? <>
            <section className="pa-replay"><div className="pa-replay-top"><span><span className={playing ? 'is-playing' : ''} />{playing ? 'Replaying sample' : 'Sample paused'}</span><strong>{sampleClock(frame.second)}</strong></div><div className="pa-speed"><strong>{frame.speedKph}<small>km/h</small></strong><span>Recorded sample speed</span></div><svg viewBox="0 0 300 76" className="pa-speed-graph" role="img" aria-label="Illustrative recorded speed over ten minutes"><path d={`M ${scenario.frames.map((item, index) => `${10 + index * 28},${68 - item.speedKph * .8}`).join(' L ')}`} /><circle cx={10 + frameIndex * 28} cy={68 - frame.speedKph * .8} r="5" /></svg><label className="pa-label" htmlFor="phone-timeline">Sample timeline · {sampleClock(frame.second)} of 10:00</label><input id="phone-timeline" type="range" min="0" max={scenario.frames.length - 1} step="1" value={frameIndex} onChange={event => { setPlaying(false); setFrameIndex(Number(event.target.value)); }} /><div className="pa-replay-controls"><button type="button" aria-label="Earlier sample frame" disabled={frameIndex === 0} onClick={() => { setPlaying(false); setFrameIndex(index => Math.max(0, index - 1)); }}><ArrowLeft size={18} /></button><button type="button" onClick={() => { if (!playing && frameIndex === scenario.frames.length - 1) setFrameIndex(0); setPlaying(value => !value); }}>{playing ? <Pause size={17} /> : <Play size={17} />}{playing ? 'Pause' : 'Play sample'}</button><button type="button" aria-label="Later sample frame" disabled={frameIndex === scenario.frames.length - 1} onClick={() => { setPlaying(false); setFrameIndex(index => Math.min(scenario.frames.length - 1, index + 1)); }}><ArrowRight size={18} /></button></div></section>
            <div className="pa-reading-grid"><div><span>Engine speed</span><strong>{frame.rpm === null ? 'Not supplied' : `${frame.rpm.toLocaleString()} rpm`}</strong></div><div><span>Coolant</span><strong>{frame.coolantC === null ? 'Not supplied' : `${frame.coolantC} °C`}</strong></div><div><span>Auxiliary voltage</span><strong>{frame.auxiliaryVolts === null ? 'Not supplied' : `${frame.auxiliaryVolts} V`}</strong></div><div><span>Data source</span><strong>Sample fixture</strong></div></div><p className="pa-small">Sample values only. EV engine/coolant fields are not provided; auxiliary voltage is not a battery health assessment.</p><button type="button" className="pa-button" onClick={() => { setPlaying(false); setScanStep('review'); }}>Review the sample scan<ArrowRight size={17} /></button><button type="button" className="pa-text-button pa-center" onClick={() => setScanStep('setup')}><ArrowLeft size={15} />Change sample recording</button>
          </> : <>
            <section className="pa-card pa-soft-card"><span className="pa-kicker">03 / THE NEXT QUESTION</span><h2>{scenario.label}</h2>{scenario.code ? <div className="pa-code"><strong>{scenario.code.code}</strong><p>{scenario.code.description}</p><small>Stored · illustrative code</small></div> : <p>{scenario.powertrain === 'electric' ? 'This sample does not provide EV battery state of health or enhanced module results.' : 'No stored code is included in this fixture. That does not establish that an actual car is clear.'}</p>}<p>{scenario.question}</p></section>
            <section className="pa-card"><h2>See the limits, too.</h2><dl className="pa-coverage"><div><dt>Engine / emissions</dt><dd>{scenario.powertrain === 'electric' ? 'Not evaluated' : 'Sample fields only'}</dd></div><div><dt>Manufacturer ECU / DME</dt><dd>Coverage check needed</dd></div><div><dt>ABS, body & other modules</dt><dd>Not evaluated</dd></div><div><dt>Vehicle condition</dt><dd>Not established</dd></div></dl><p className="pa-small">Actual access depends on the vehicle, adapter, protocols and app. A scan does not replace an independent inspection.</p></section>
            <button type="button" className="pa-button" onClick={attachSample}><ClipboardCheck size={17} />Attach sample & mark checked</button><p className="pa-small">Adds this illustrative recording to {scanCar?.name || 'the selected car'}. No real car was scanned.</p>
            <section className="pa-card"><span className="pa-kicker">HIGHER PACKAGE / PLANNED ONLINE HELP</span><h2>Someone on your side.</h2><p>A future live advisor could review the session when you’re stopped. Try a scripted example:</p><div className="pa-topic-buttons">{[{ id: 'code', label: 'A code came up' }, { id: 'records', label: 'Records are missing' }].map(item => <button type="button" key={item.id} aria-pressed={supportTopic === item.id} onClick={() => setSupportTopic(item.id)}>{item.label}</button>)}</div>{supportTopic && <p role="status" className="pa-sample-reply"><strong>Sample advisor:</strong> {supportTopic === 'code' ? 'Keep the code and the conditions it appeared under. Ask a qualified technician to investigate; a code does not confirm a failed part.' : 'Ask for dated service invoices and a current history report. Keep unanswered questions visible before considering an offer.'}</p>}<p className="pa-small">Scripted response. No human advisor is connected.</p></section><button type="button" className="pa-button pa-button-outline" onClick={() => { setFrameIndex(0); setScanStep('replay'); }}><RotateCcw size={16} />Replay the sample</button>
          </>}
        </>}
        {notice && <div className="pa-notice" role="status"><CheckCircle2 size={17} /><p>{notice}</p><button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={15} /></button></div>}
        <div className="pa-bottom-note">CarVet app concept · Sample data only</div>
      </div>
      <nav className="pa-bottom-nav" aria-label="Phone app navigation">{[{ id: 'home', label: 'My search', icon: Home }, { id: 'discover', label: 'Discover', icon: Search }, { id: 'garage', label: 'My cars', icon: Car }, { id: 'scanner', label: 'Scanner', icon: Radio }].map(item => <button type="button" key={item.id} aria-current={tab === item.id ? 'page' : undefined} className={tab === item.id ? 'selected' : ''} onClick={() => openTab(item.id as Tab)}><item.icon size={21} strokeWidth={tab === item.id ? 2.1 : 1.65} /><span>{item.label}</span>{tab === item.id && <i />}</button>)}</nav>
    </div>
  </main>;
}

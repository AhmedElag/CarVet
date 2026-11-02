/** Only API/server code imports this module. No browser component imports it. */
import weights from './model.json' with {type: 'json'};
import inventory from './catalog.json' with {type: 'json'};
import {initializeEngine, recommend} from './engine.js';

if (typeof window !== 'undefined') throw new Error('Vehicle matching is available only on the server.');
initializeEngine(weights, inventory);

const allowedFields = new Set(['text','budget','max_mileage','min_seats','body','powertrain','awd','clean_only','exclude_electric','priority']);
const publicVehicleFields = ['id','year','make','model','price_cad','mileage_km','seats','body','powertrain','drivetrain','range_km','accident_history','score','reasons'];

export function matchVehicles(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Preferences must be a JSON object.');
  if (Object.keys(raw).some(key => !allowedFields.has(key))) throw new Error('Unsupported preference field.');
  const match = recommend(raw);
  return {
    results: match.results.map(vehicle => ({
      ...Object.fromEntries(publicVehicleFields.map(key => [key, vehicle[key]])),
      tradeoff: vehicle.tradeoff.startsWith('Less aligned')
        ? 'Other options may align more closely with your stated priorities.'
        : 'Compare condition and ownership costs before choosing.'
    })),
    total_matches: match.total_matches,
    inventory_count: match.inventory_count,
    constraints: match.constraints
  };
}

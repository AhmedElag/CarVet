import test from "node:test";
import assert from "node:assert/strict";
import { matchSampleVehicles } from "./sample-match.ts";
import inventory from "./sample-inventory.json" with { type: "json" };

const brief = { text: "", budget: "35000", max_mileage: "120000", min_seats: "5", body: "any", powertrain: "any", awd: false, clean_only: false };

test("sample shortlist respects every active requirement and transparent price ordering", () => {
  const result = matchSampleVehicles({ ...brief, body: "suv", awd: true, clean_only: true });
  assert.equal(result.results[0].id, "DEMO-027");
  assert.equal(result.total_matches, 5);
  for (const car of result.results) {
    assert.ok(car.price_cad <= 35000 && car.mileage_km <= 120000 && car.seats >= 5);
    assert.equal(car.body, "suv");
    assert.ok(["AWD", "4WD"].includes(car.drivetrain));
    assert.equal(car.accident_history, "none_reported");
    assert.equal(car.score, Math.round((1 - car.price_cad / 35000) * 1000) / 10);
  }
  assert.deepEqual(result.results.map(car => car.price_cad), result.results.map(car => car.price_cad).toSorted((a, b) => a - b));
});

test("explicit form requirements take priority over the story", () => {
  const result = matchSampleVehicles({ ...brief, text: "I need an electric SUV for six people", body: "hatchback", powertrain: "gas", min_seats: "5", budget: "22000" });
  assert.ok(result.results.length);
  assert.equal(result.constraints.body, "hatchback");
  assert.equal(result.constraints.powertrain, "gas");
  assert.equal(result.constraints.min_seats, 5);
  assert.ok(result.results.every(car => car.body === "hatchback" && car.powertrain === "gas" && car.price_cad <= 22000));
});

test("simple story inference applies only to unselected options and handles no electric", () => {
  const ev = matchSampleVehicles({ ...brief, text: "An electric daily driver", budget: "40000" });
  assert.ok(ev.results.length && ev.results.every(car => car.powertrain === "electric"));
  const noEv = matchSampleVehicles({ ...brief, text: "No electric car please" });
  assert.equal(noEv.constraints.exclude_electric, true);
  assert.ok(noEv.results.every(car => car.powertrain !== "electric"));
  const override = matchSampleVehicles({ ...brief, text: "No electric car please", powertrain: "electric" });
  assert.ok(override.results.every(car => car.powertrain === "electric"));
});

test("empty results keep the requested limits without silently relaxing them", () => {
  const result = matchSampleVehicles({ ...brief, budget: "1000", body: "suv", min_seats: "7" });
  assert.equal(result.results.length, 0);
  assert.equal(result.total_matches, 0);
  assert.equal(result.constraints.budget, 1000);
  assert.equal(result.constraints.min_seats, 7);
  assert.equal(result.constraints.body, "suv");
});

test("invalid requirements produce readable validation errors", () => {
  for (const update of [{ budget: "abc" }, { budget: "0" }, { max_mileage: "-1" }, { min_seats: "1.5" }, { body: "rocket" }, { awd: "true" }]) {
    assert.throws(() => matchSampleVehicles({ ...brief, ...update }));
  }
});

test("filter combinations never return a car outside the stated hard limits", () => {
  let combinations = 0;
  for (const budget of [15000, 25000, 40000]) for (const mileage of [60000, 120000]) for (const seats of [2, 5, 7]) for (const body of ["any", "suv"]) for (const powertrain of ["any", "electric"]) for (const awd of [false, true]) {
    const result = matchSampleVehicles({ ...brief, budget, max_mileage: mileage, min_seats: seats, body, powertrain, awd, clean_only: true });
    assert.ok(result.results.length <= 5);
    for (const car of result.results) {
      assert.ok(car.price_cad <= budget && car.mileage_km <= mileage && car.seats >= seats);
      assert.ok(body === "any" || car.body === body);
      assert.ok(powertrain === "any" || car.powertrain === powertrain);
      assert.ok(!awd || ["AWD", "4WD"].includes(car.drivetrain));
      assert.equal(car.accident_history, "none_reported");
    }
    combinations++;
  }
  assert.equal(combinations, 144);
});

test("browser inventory contains only public synthetic listing fields", () => {
  assert.equal(inventory.length, 28);
  const expected = "accident_history body drivetrain id make mileage_km model powertrain price_cad range_km seats year".split(" ");
  assert.ok(inventory.every(car => JSON.stringify(Object.keys(car).sort()) === JSON.stringify(expected)));
});

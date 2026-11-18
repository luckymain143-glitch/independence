import React, { useMemo } from 'react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import type { OpportunityCategory, Territory } from '../types';

interface LocationValue {
  state: string;
  district: string;
  city: string;
  pinCode: string;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  territories: Territory[];
  category: OpportunityCategory;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  territories,
  category,
}) => {
  const allStates = useMemo(() => {
    const map = new Map<string, { name: string; type: 'State' | 'Union Territory' }>();
    INDIA_LOCATIONS.forEach((s) => map.set(s.name, { name: s.name, type: s.type }));
    territories.forEach((t) => {
      if (!map.has(t.state)) {
        map.set(t.state, { name: t.state, type: t.stateType });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [territories]);

  const districts = useMemo(() => {
    if (!value.state) return [];
    const set = new Set<string>();
    const found = INDIA_LOCATIONS.find((s) => s.name === value.state);
    if (found) {
      found.districts.forEach((d) => set.add(d.district));
    }
    territories
      .filter((t) => t.state === value.state)
      .forEach((t) => set.add(t.district));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [value.state, territories]);

  const cities = useMemo(() => {
    if (!value.state || !value.district) return [];
    const map = new Map<string, string>();
    const foundState = INDIA_LOCATIONS.find((s) => s.name === value.state);
    const foundDist = foundState?.districts.find((d) => d.district === value.district);
    if (foundDist) {
      foundDist.cities.forEach((c) => map.set(c.city, c.pinCode));
    }
    territories
      .filter((t) => t.state === value.state && t.district === value.district)
      .forEach((t) => map.set(t.city, t.pinCode));
    return Array.from(map.entries()).map(([city, pinCode]) => ({ city, pinCode }));
  }, [value.state, value.district, territories]);

  const matchedTerritory = useMemo(() => {
    if (!value.state || !value.district) return null;
    return (
      territories.find(
        (t) =>
          t.state === value.state &&
          t.district === value.district &&
          (!value.pinCode || t.pinCode === value.pinCode)
      ) || null
    );
  }, [territories, value.state, value.district, value.pinCode]);

  const isClosed =
    matchedTerritory &&
    (matchedTerritory.status === 'closed' ||
      matchedTerritory.status === 'allocated' ||
      (matchedTerritory.availableCategories.length > 0 &&
        !matchedTerritory.availableCategories.includes(category)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            State / Union Territory *
          </label>
          <select
            required
            value={value.state}
            onChange={(e) =>
              onChange({
                state: e.target.value,
                district: '',
                city: '',
                pinCode: '',
              })
            }
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
          >
            <option value="">Select State / UT (36)</option>
            <optgroup label="28 States">
              {allStates
                .filter((s) => s.type === 'State')
                .map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="8 Union Territories">
              {allStates
                .filter((s) => s.type === 'Union Territory')
                .map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            District *
          </label>
          <select
            required
            disabled={!value.state}
            value={value.district}
            onChange={(e) => {
              const distName = e.target.value;
              const foundState = INDIA_LOCATIONS.find((s) => s.name === value.state);
              const foundDist = foundState?.districts.find((d) => d.district === distName);
              const firstCity = foundDist?.cities[0];
              onChange({
                state: value.state,
                district: distName,
                city: firstCity?.city || '',
                pinCode: firstCity?.pinCode || '',
              });
            }}
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447] disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">Select District</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            City / Town *
          </label>
          {cities.length > 0 ? (
            <div className="space-y-1.5">
              <input
                required
                type="text"
                list="india-city-suggestions"
                value={value.city}
                onChange={(e) => {
                  const chosen = cities.find((c) => c.city === e.target.value);
                  onChange({
                    ...value,
                    city: e.target.value,
                    pinCode: chosen ? chosen.pinCode : value.pinCode,
                  });
                }}
                placeholder="Select or enter City"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
              />
              <datalist id="india-city-suggestions">
                {cities.map((c) => (
                  <option key={c.city} value={c.city} />
                ))}
              </datalist>
            </div>
          ) : (
            <input
              required
              disabled={!value.district}
              type="text"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="Enter City / Town"
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447] disabled:bg-slate-100"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            PIN Code (6 Digits) *
          </label>
          <input
            required
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="^[0-9]{6}$"
            value={value.pinCode}
            onChange={(e) =>
              onChange({
                ...value,
                pinCode: e.target.value.replace(/\D/g, '').slice(0, 6),
              })
            }
            placeholder="e.g. 110001"
            className="w-full px-3 py-2.5 text-sm font-mono-tabular bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
          />
        </div>
      </div>

      {value.state && value.district && (
        <div
          className={`rounded-lg border px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2 ${
            isClosed
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span>
            <strong>Territory Check ({value.district}, {value.state}):</strong>{' '}
            {isClosed
              ? `Currently marked ${matchedTerritory?.status.toUpperCase()} for this category. Submission may be waitlisted unless reopened by Admin.`
              : 'Open for applications. Final allocation remains subject to Territory Availability Check and Management Review.'}
          </span>
          <span className="font-mono-tabular font-semibold">
            {isClosed ? 'STATUS: RESTRICTED' : 'STATUS: OPEN FOR APPLICATION'}
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PHCRecord, HospitalRecord, OutbreakThreat, StockTransferOrder } from '../../types';
import { Layers } from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface DistrictDynamicMapProps {
  phcs: PHCRecord[];
  hospitals: HospitalRecord[];
  outbreakThreats: OutbreakThreat[];
  transfers: StockTransferOrder[];
}

export const DistrictDynamicMap: React.FC<DistrictDynamicMapProps> = ({
  phcs,
  hospitals,
  outbreakThreats,
  transfers,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'shortages' | 'threats' | 'hospitals' | 'ucp'>('all');

  // Center of Kanpur district roughly
  const center: [number, number] = [26.4499, 80.3319];

  // Mock threat zones (polygons around some coordinates)
  const floodZone: [number, number][] = [
    [26.55, 80.20],
    [26.65, 80.25],
    [26.62, 80.35],
    [26.50, 80.30],
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg relative z-0">
      <div className="p-4 bg-slate-100/80 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Dynamic District Health & Epidemic GIS Map
            </h3>
            <p className="text-[11px] text-slate-600">
              Interactive map with live epidemic threats, PHC drug shortages, bed occupancies, and UCP routing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-300 text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1 rounded-lg transition ${activeLayer === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('shortages')}
            className={`px-3 py-1 rounded-lg transition ${activeLayer === 'shortages' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
          >
            PHC Shortages
          </button>
          <button
            onClick={() => setActiveLayer('threats')}
            className={`px-3 py-1 rounded-lg transition ${activeLayer === 'threats' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
          >
            Warnings (IMD/CWC/NDMA)
          </button>
          <button
            onClick={() => setActiveLayer('hospitals')}
            className={`px-3 py-1 rounded-lg transition ${activeLayer === 'hospitals' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          >
            Govt Hospitals
          </button>
          
        </div>
      </div>

      <div className="w-full h-[500px] z-0">
        <MapContainer center={center} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          
          {(activeLayer === 'all' || activeLayer === 'hospitals') && hospitals.map(hosp => (
            <CircleMarker 
              key={hosp.id} 
              center={[hosp.coordinates.lat, hosp.coordinates.lng]} 
              radius={8}
              color="#6366f1"
              fillColor="#4f46e5"
              fillOpacity={0.7}
            >
              <Popup className="text-slate-900">
                <div className="font-bold">{hosp.name}</div>
                <div className="text-xs">{hosp.type}</div>
                <div className="text-xs mt-1 text-rose-600 font-semibold">Occupancy: {hosp.occupiedBeds}/{hosp.totalBeds} Beds</div>
              </Popup>
            </CircleMarker>
          ))}

          {(activeLayer === 'all' || activeLayer === 'shortages') && phcs.map(phc => (
            <CircleMarker 
              key={phc.id} 
              center={[phc.coordinates.lat, phc.coordinates.lng]} 
              radius={6}
              color="#0ea5e9"
              fillColor="#38bdf8"
              fillOpacity={0.8}
            >
              <Popup className="text-slate-900">
                <div className="font-bold">{phc.name}</div>
                <div className="text-xs">{phc.areaType} Area</div>
                <div className="text-xs mt-1 text-slate-600">ID: {phc.id}</div>
              </Popup>
            </CircleMarker>
          ))}

          {(activeLayer === 'all' || activeLayer === 'threats') && (
            <>
              <Polygon positions={floodZone} color="#ef4444" fillColor="#f87171" fillOpacity={0.3}>
                 <Popup className="text-slate-900 font-bold">CWC River Surge Risk Zone</Popup>
              </Polygon>
              <Circle center={[26.40, 80.35]} radius={4000} color="#f59e0b" fillColor="#fbbf24" fillOpacity={0.3}>
                 <Popup className="text-slate-900 font-bold">Aedes Index Alert (Dengue/Vector Outbreak)</Popup>
              </Circle>
            </>
          )}

          </MapContainer>
      </div>
    </div>
  );
};

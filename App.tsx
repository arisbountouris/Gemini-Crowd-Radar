import React, { useState, useEffect } from 'react';
import { fetchCrowdData } from './services/geminiService';
import { Place, Coordinates, GroundingChunk } from './types';
import PlaceCard from './components/PlaceCard';
import { Search, MapPin, Loader2, AlertCircle, RefreshCw, Radar, Scan, Crosshair } from 'lucide-react';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<Coordinates | undefined>(undefined);
  const [locationError, setLocationError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize with geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation denied or failed", err);
          setLocationError("GPS Signal Lost. Using default scan parameters.");
        }
      );
    } else {
      setLocationError("Geolocation module not supported.");
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setPlaces([]); // Clear previous results for dramatic effect
    
    try {
      const data = await fetchCrowdData(query, location);
      setPlaces(data.places);
      setGroundingChunks(data.groundingChunks);
    } catch (err) {
      setError("Scan failed. Unable to retrieve crowd telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setTimeout(() => {
        const executeSearch = async () => {
            setLoading(true);
            setError(null);
            setHasSearched(true);
            setPlaces([]);
            try {
                const data = await fetchCrowdData(term, location);
                setPlaces(data.places);
                setGroundingChunks(data.groundingChunks);
            } catch (err) {
                setError("Scan failed. Unable to retrieve crowd telemetry.");
            } finally {
                setLoading(false);
            }
        };
        executeSearch();
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
         {/* Grid */}
         <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
         {/* Radar Sweep Effect (only when loading or idle) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none opacity-20"></div>
      </div>

      {/* Header / Floating Search */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-4 pt-6 pb-2 pointer-events-none">
        <div className="flex flex-col items-center justify-center w-full pointer-events-auto">
          
          {/* Search Container */}
          <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-500">
            <form onSubmit={handleSearch} className="flex items-center p-2">
               <div className="pl-3 pr-2 text-slate-500">
                 <Search size={18} />
               </div>
               <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search map for crowds..." 
                  className="flex-grow bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:ring-0 outline-none h-10 font-medium"
                />
               <div className="h-6 w-[1px] bg-slate-700 mx-2"></div>
               <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : 'Scan'}
               </button>
            </form>
            
            {/* Quick Suggestions (Only show if not searched yet or empty) */}
            {!hasSearched && !loading && (
              <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 border-t border-slate-800/50 no-scrollbar">
                <span className="text-[10px] uppercase text-slate-500 font-mono whitespace-nowrap">Quick Scan:</span>
                {['Nightclubs', 'Coffee Shops', 'Gyms', 'Parks'].map(term => (
                   <button 
                     key={term}
                     onClick={() => handleQuickSearch(term)}
                     className="px-2 py-1 bg-slate-800/50 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-mono border border-slate-700 transition-colors whitespace-nowrap"
                   >
                     {term}
                   </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Status Bar */}
          <div className="mt-3 flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-slate-500 bg-slate-950/50 backdrop-blur rounded-full px-4 py-1 border border-slate-800/50">
             <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
               {location ? 'GPS LOCKED' : 'GPS SEARCHING'}
             </div>
             <div className="w-[1px] h-3 bg-slate-700"></div>
             <div>SYSTEM READY</div>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 pb-8 overflow-y-auto overflow-x-hidden pt-6">
        
        {/* Loading State - Radar Animation */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
               <div className="absolute w-64 h-64 border border-blue-500/20 rounded-full animate-pulse-ring"></div>
               <div className="absolute w-48 h-48 border border-blue-500/30 rounded-full animate-pulse-ring delay-75"></div>
               <div className="absolute w-32 h-32 border border-blue-500/40 rounded-full animate-scan border-t-transparent border-l-transparent"></div>
               <Radar size={48} className="text-blue-400 opacity-80" />
            </div>
            <p className="mt-8 font-mono text-blue-400 text-xs tracking-[0.2em] animate-pulse">ACQUIRING SATELLITE DATA...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center mt-10">
            <div className="bg-red-950/40 backdrop-blur border border-red-900/50 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md">
               <AlertCircle size={20} />
               <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && places.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600">
             <Crosshair size={48} className="mb-4 opacity-20" />
             <p className="font-mono text-xs uppercase tracking-widest">No Signals Detected in this Sector</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && places.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Scan size={14} />
                  Detected Points of Interest ({places.length})
                </h2>
                <button onClick={(e) => handleSearch(e)} className="text-slate-500 hover:text-white transition-colors">
                  <RefreshCw size={14} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {places.map((place, index) => (
                 <div key={place.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <PlaceCard place={place} />
                 </div>
               ))}
             </div>

             {/* Source Footer */}
             <div className="mt-8 pt-6 border-t border-slate-800/50 px-2">
                <div className="flex flex-wrap gap-2 justify-center opacity-60 hover:opacity-100 transition-opacity">
                   {groundingChunks.filter(c => c.maps?.uri).slice(0, 4).map((chunk, i) => (
                      <a 
                        key={i}
                        href={chunk.maps?.uri}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                      >
                         <MapPin size={10} />
                         <span className="truncate max-w-[100px]">{chunk.maps?.title || "Data Source"}</span>
                      </a>
                   ))}
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-4 font-mono">
                  DATA PROVIDED BY GEMINI AI + GOOGLE MAPS GROUNDING. ESTIMATES ONLY.
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
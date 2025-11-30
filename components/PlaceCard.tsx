import React from 'react';
import { Place } from '../types';
import CrowdMeter from './CrowdMeter';
import { MapPin, Navigation, ExternalLink, Activity } from 'lucide-react';
import clsx from 'clsx';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const isCrowded = place.crowdLevel >= 70;

  // Dynamic border color based on crowd level
  const borderColor = 
    place.crowdLevel >= 80 ? 'border-red-500/30' :
    place.crowdLevel >= 60 ? 'border-orange-500/30' :
    place.crowdLevel >= 30 ? 'border-yellow-500/30' :
    'border-emerald-500/30';

  const glowColor =
    place.crowdLevel >= 80 ? 'shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]' :
    place.crowdLevel >= 60 ? 'shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]' :
    'shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]';

  return (
    <div className={clsx(
      "group relative flex flex-col p-0 rounded-xl border bg-slate-900/40 backdrop-blur-xl transition-all duration-300 overflow-hidden",
      borderColor,
      glowColor,
      "hover:scale-[1.01] hover:bg-slate-900/60"
    )}>
      
      {/* Top Decorative Line */}
      <div className={clsx("absolute top-0 left-0 w-full h-1 opacity-50", 
         place.crowdLevel >= 80 ? 'bg-red-500' :
         place.crowdLevel >= 60 ? 'bg-orange-500' :
         place.crowdLevel >= 30 ? 'bg-yellow-500' :
         'bg-emerald-500'
      )} />

      {/* Header Section */}
      <div className="p-5 pb-3 flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="bg-slate-800/80 p-1.5 rounded-md border border-slate-700/50">
               <MapPin size={14} className="text-slate-300" />
             </div>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{place.category}</span>
           </div>
           <h3 className="text-lg font-bold text-slate-100 leading-tight pr-4">{place.name}</h3>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end">
           {isCrowded && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">High Traffic</span>
            </div>
           )}
        </div>
      </div>

      {/* Meter Section */}
      <div className="px-5 py-2">
        <CrowdMeter level={place.crowdLevel} size="md" />
      </div>

      {/* Description */}
      <div className="px-5 py-3 flex-grow">
        <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-3">
          {place.description}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 mt-auto flex flex-col gap-3">
        <div className="flex items-start gap-2 text-xs text-slate-500 font-mono">
           <span className="text-slate-600">LOC:</span>
           <span className="truncate">{place.address}</span>
        </div>
        
        {place.googleMapsUri && (
          <a 
            href={place.googleMapsUri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group/btn relative flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
          >
            <Navigation size={14} className="group-hover/btn:text-blue-400 transition-colors" />
            <span>Navigate</span>
            <ExternalLink size={12} className="ml-1 opacity-50" />
          </a>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
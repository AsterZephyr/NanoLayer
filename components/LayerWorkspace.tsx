import React from 'react';
import { Layer, LayerType } from '../types';

interface LayerWorkspaceProps {
  layers: Layer[];
  onSplitRequest: (originalLayerId: string) => void;
  isProcessing: boolean;
}

export const LayerWorkspace: React.FC<LayerWorkspaceProps> = ({ layers, onSplitRequest, isProcessing }) => {
  // Group layers by parent ID (or self if original) to show sets
  const layerSets = React.useMemo(() => {
    const sets: Record<string, Layer[]> = {};
    
    // First find all originals
    layers.filter(l => l.type === LayerType.ORIGINAL).forEach(l => {
      sets[l.id] = [l];
    });

    // Then attach children
    layers.filter(l => l.type !== LayerType.ORIGINAL).forEach(l => {
      if (l.parentId && sets[l.parentId]) {
        sets[l.parentId].push(l);
      }
    });

    // Sort sets by creation time (newest first)
    return Object.values(sets).sort((a, b) => b[0].createdAt - a[0].createdAt);
  }, [layers]);

  if (layers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 text-neutral-500 p-8 text-center">
        <div>
          <div className="mb-4 inline-block p-4 rounded-full bg-neutral-900 border border-neutral-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="max-w-md mx-auto">
            No assets generated yet. Use the chat on the left to create your first ad creative.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 p-6 space-y-12">
      {layerSets.map((set) => {
        const original = set.find(l => l.type === LayerType.ORIGINAL)!;
        const subject = set.find(l => l.type === LayerType.SUBJECT);
        const background = set.find(l => l.type === LayerType.BACKGROUND);
        const hasSplits = !!subject || !!background;

        return (
          <div key={original.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                Asset #{original.id.slice(0, 4)}
              </h2>
              <span className="text-xs text-neutral-600 font-mono">
                {new Date(original.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Original Card */}
              <div className="group relative bg-neutral-900 rounded-xl border border-neutral-800 p-2 shadow-lg hover:border-neutral-700 transition-colors">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-950 relative">
                  <img 
                    src={`data:image/png;base64,${original.base64Data}`} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
                    Original
                  </div>
                </div>
                
                {!hasSplits && (
                  <div className="mt-2">
                    <button
                      onClick={() => onSplitRequest(original.id)}
                      disabled={isProcessing}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg border border-neutral-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                          Split Layers
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Subject Layer */}
              {subject ? (
                <div className="group bg-neutral-900 rounded-xl border border-neutral-800 p-2 shadow-lg animate-in zoom-in-95 duration-300">
                  <div className="aspect-square rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-neutral-950 relative">
                    <img 
                      src={`data:image/png;base64,${subject.base64Data}`} 
                      alt="Subject" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-600/80 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
                      Layer: Subject
                    </div>
                  </div>
                </div>
              ) : hasSplits && isProcessing ? (
                 <div className="aspect-square rounded-xl border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-neutral-600 border-t-transparent rounded-full"/>
                    <span className="text-xs">Extracting Subject...</span>
                 </div>
              ) : null}

              {/* Background Layer */}
              {background ? (
                <div className="group bg-neutral-900 rounded-xl border border-neutral-800 p-2 shadow-lg animate-in zoom-in-95 duration-300 delay-100">
                  <div className="aspect-square rounded-lg overflow-hidden bg-neutral-950 relative">
                    <img 
                      src={`data:image/png;base64,${background.base64Data}`} 
                      alt="Background" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
                      Layer: Background
                    </div>
                  </div>
                </div>
              ) : hasSplits && isProcessing ? (
                 <div className="aspect-square rounded-xl border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-neutral-600 border-t-transparent rounded-full"/>
                    <span className="text-xs">Inpainting Background...</span>
                 </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
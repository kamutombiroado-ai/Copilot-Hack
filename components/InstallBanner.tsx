
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      // Show iOS banner after a short delay
      setTimeout(() => setIsVisible(true), 3000);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-700">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-md mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
              <div className="scale-125">
                 <Icons.TrendingUp />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base">Install WealthTrack AI</h4>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {isIOS 
                  ? "Tap the Share button and select 'Add to Home Screen' for the best experience." 
                  : "Install the app for quick access and a better fullscreen experience."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-slate-400 hover:text-white p-1"
          >
            <Icons.X />
          </button>
        </div>
        
        {!isIOS && (
          <div className="mt-4 flex justify-end gap-3">
             <button 
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Not Now
            </button>
            <button 
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              Install App
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallBanner;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FuzzyText from '../components/FuzzyText';
import GeometricGridBackground from '../components/GeometricGridBackground';
import { Button } from '../components/ui/button';
import { Home, LayoutDashboard, ArrowLeft, CloudOff, Sparkles } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-background overflow-hidden px-4">
      {/* Background Interactive Canvas */}
      <div className="absolute inset-0 z-0">
        <GeometricGridBackground
          gridSpacing={42}
          proximityRadius={220}
          maxShapeSize={32}
          dotSize={3}
        />
      </div>

      {/* Apple Liquid Glass Shatters Card (Ultra Transparent) */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),_inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7),_inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 group hover:border-white/70 dark:hover:border-white/20">
        
        {/* Specular Light Reflection Sweep Line */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

        {/* Liquid Glass Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/5 border border-white/40 dark:border-white/15 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md">
          <CloudOff className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>404 &bull; Page Not Found</span>
        </div>

        {/* Animated Fuzzy 404 Liquid Shatters Typography */}
        <div className="flex justify-center items-center my-2 select-none filter drop-shadow-[0_10px_25px_rgba(59,130,246,0.3)]">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={0.55}
            enableHover
            fontSize="clamp(5.5rem, 15vw, 10rem)"
            fontWeight={900}
            color="#3B82F6"
          >
            404
          </FuzzyText>
        </div>

        {/* Message Headings */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground/95">
            Lost in the Cloud
          </h1>
          <p className="text-muted-foreground/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
            The page, file, or folder you're looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Apple Liquid Glass Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto h-12 px-6 rounded-2xl font-semibold gap-2 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/15 text-foreground border border-white/40 dark:border-white/15 shadow-sm backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(59,130,246,0.4),_inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all active:scale-[0.98] gap-2">
              <Home className="w-4 h-4" /> Return to Home
            </Button>
          </Link>

          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-6 rounded-2xl font-semibold gap-2 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/15 text-foreground border border-white/40 dark:border-white/15 shadow-sm backdrop-blur-md transition-all active:scale-[0.98]">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

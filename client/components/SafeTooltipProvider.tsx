import React, { ReactNode, useEffect, useState, useRef } from "react";

interface SafeTooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function SafeTooltipProvider({ children, delayDuration = 300 }: SafeTooltipProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [TooltipProvider, setTooltipProvider] = useState<React.ComponentType<any> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Ensure component is still mounted
    mountedRef.current = true;

    // Dynamically import and initialize TooltipProvider
    const initializeTooltipProvider = async () => {
      try {
        // Wait for next tick to ensure React context is fully initialized
        await new Promise(resolve => setTimeout(resolve, 0));

        if (!mountedRef.current) return;

        // Dynamically import the TooltipProvider to ensure React context is ready
        const { TooltipProvider: ImportedTooltipProvider } = await import("@/components/ui/tooltip");

        if (!mountedRef.current) return;

        setTooltipProvider(() => ImportedTooltipProvider);
        setIsReady(true);
      } catch (error) {
        console.warn("TooltipProvider failed to load, continuing without tooltips:", error);
        if (mountedRef.current) {
          setIsReady(true); // Continue without TooltipProvider
        }
      }
    };

    initializeTooltipProvider();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Render children without TooltipProvider until ready
  if (!isReady || !TooltipProvider) {
    return <>{children}</>;
  }

  try {
    return (
      <TooltipProvider delayDuration={delayDuration}>
        {children}
      </TooltipProvider>
    );
  } catch (error) {
    console.error("TooltipProvider runtime error:", error);
    // Fallback: render children without tooltip functionality
    return <>{children}</>;
  }
}

export default SafeTooltipProvider;

import { useEffect, useRef } from "react";

interface PluginSlotProps {
  name: string;
  className?: string;
}

export default function PluginSlot({ name, className }: PluginSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tryRender = () => {
      if ((window as any).Noteva) {
        (window as any).Noteva.slots.render(name, ref.current);
      } else {
        setTimeout(tryRender, 100);
      }
    };
    tryRender();
  }, [name]);

  return <div ref={ref} data-noteva-slot={name} className={className} />;
}

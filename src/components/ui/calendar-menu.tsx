import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar as CalendarIcon } from "lucide-react";

export const CalendarMenu = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleNavigate = (module: string) => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule(module);
    }
  };

  return (
    <Card className="flex w-full max-w-[320px] flex-col gap-0 p-0 bento-card border-skel-metal/20 overflow-hidden shadow-2xl bg-skel-space/90 backdrop-blur-xl">
      <CardHeader className="p-4 border-b border-skel-metal/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-focus-neon" size={16} />
            <h3 className="text-xs font-display font-black tracking-tight text-text-primary uppercase">
              Hızlı Takvim
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-none"
          classNames={{
            day_today: "bg-focus-neon/20 text-focus-neon font-bold",
            day_selected: "bg-focus-neon text-pure-white hover:bg-focus-neon hover:text-pure-white focus:bg-focus-neon focus:text-pure-white",
          }}
        />
      </CardContent>

      <div className="p-3 border-t border-skel-metal/10 bg-skel-matte/5">
        <Button 
          variant="ghost" 
          className="w-full h-9 text-[10px] font-black uppercase tracking-widest text-focus-neon hover:bg-focus-neon/10 rounded-xl flex items-center justify-center gap-2 group"
          onClick={() => handleNavigate('calendar-page')}
        >
          Tam Takvimi Aç
          <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

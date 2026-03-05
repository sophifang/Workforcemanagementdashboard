import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea, Legend } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DemandForecastChartProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date, volume: number) => void;
  onJumpToToday: () => void;
}

// Simple seeded random function
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function DemandForecastChart({ weekStart, onPrevWeek, onNextWeek, selectedDate, onSelectDate, onJumpToToday }: DemandForecastChartProps) {
  const { theme } = useTheme();
  
  const currentData = useMemo(() => {
    const data = [];
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const baseVolume = isWeekend ? 6000 : 12500;
      
      // Use date timestamp as seed for consistent random values
      const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
      const randomVal = seededRandom(seed);
      const noise = randomVal * 2000 - 1000;
      
      const isToday = day.getTime() === today.getTime();
      const isPast = day.getTime() < today.getTime();
      const isFuture = day.getTime() > today.getTime();
      const isSelected = day.getTime() === new Date(selectedDate.setHours(0,0,0,0)).getTime();
      const mm = day.getMonth() + 1;
      const dd = day.getDate();
      const dateStr = `${mm}/${dd}`;
      const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });

      data.push({
        date: day,
        name: `${weekday} ${dateStr}`,
        fullName: day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        calls: Math.max(4000, Math.floor(baseVolume + noise)),
        isToday: isToday,
        isPast: isPast,
        isFuture: isFuture,
        isSelected: isSelected
      });
    }
    return data;
  }, [weekStart, selectedDate]);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  // Find the 'name' (x-axis key) for today, if it exists in the current view
  const todayEntry = currentData.find(d => d.isToday);

  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <style>{`
        .recharts-wrapper {
          outline: none !important;
        }
      `}</style>
      <div className="flex flex-row justify-between items-center mb-4 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
             <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Weekly Demand Forecast</h2>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-0">
              <span>{formatDateRange(weekStart, weekEnd)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <button
                onClick={onJumpToToday}
                className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-blue-600 dark:text-blue-400 flex items-center space-x-1 mr-1 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title="Jump to Today"
            >
                <span className="text-xs font-semibold px-1">Today</span>
            </button>

            <button
                onClick={onPrevWeek}
                className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Previous week"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button
                onClick={onNextWeek}
                className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Next week"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 'calc(100% - 60px)', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <BarChart
              data={currentData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const payload = e.activePayload[0].payload;
                  // Estimate Peak Hourly volume as approx 10-12% of daily total
                  const estimatedHourly = Math.round(payload.calls * 0.12);
                  onSelectDate(payload.date, estimatedHourly);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={({ x, y, payload }) => {
                  // Find the data item to check if it's today
                  // payload.value is the name
                  const dataItem = currentData.find(d => d.name === payload.value);
                  const isToday = dataItem?.isToday;
                  const isSelected = dataItem?.isSelected;

                  // Add click handler to the tick
                  return (
                    <g 
                      transform={`translate(${x},${y})`} 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                          e.stopPropagation();
                          if (dataItem) {
                             const estimatedHourly = Math.round(dataItem.calls * 0.12);
                             onSelectDate(dataItem.date, estimatedHourly);
                          }
                      }}
                    >
                      <text 
                        x={0} 
                        y={0} 
                        dy={16} 
                        textAnchor="middle" 
                        fill={isSelected ? "#2563EB" : isToday ? (theme === 'dark' ? "#60A5FA" : "#3B82F6") : "#64748B"} 
                        fontSize={12}
                        fontWeight={isSelected || isToday ? "bold" : "normal"}
                        className="dark:fill-slate-400"
                      >
                        {payload.value}
                      </text>
                      {/* Invisible rect for larger click area */}
                      <rect x="-20" y="0" width="40" height="30" fill="transparent" />
                    </g>
                  );
                }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9', opacity: 0.1 }}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                        <div className={`p-3 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{data.fullName}</p>
                                {data.isToday && <span className="text-[10px] leading-none bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">Today</span>}
                                {data.isFuture && <span className="text-[10px] leading-none bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">Forecast</span>}
                            </div>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {Number(payload[0].value).toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">calls</span>
                            </p>
                        </div>
                    );
                    }
                    return null;
                }}
              />
              {todayEntry && (
                  <ReferenceArea 
                      x1={todayEntry.name} 
                      x2={todayEntry.name} 
                      fill={theme === 'dark' ? "#1E3A8A" : "#DBEAFE"} 
                      fillOpacity={0.5} 
                      ifOverflow="visible"
                  />
              )}
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                content={() => (
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#94a3b8', opacity: 0.6 }}></div>
                      <span className="text-slate-600 dark:text-slate-400">Observed (Past)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6', opacity: 0.6 }}></div>
                      <span className="text-slate-600 dark:text-slate-400">Demand Forecast (Future)</span>
                    </div>
                  </div>
                )}
              />
              <Bar 
                dataKey="calls" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {currentData.map((entry, index) => {
                  let fillColor;
                  let opacity;
                  
                  if (entry.isSelected) {
                    // Selected date gets highlighted
                    if (entry.isFuture) {
                      fillColor = "#3b82f6"; // Blue for future demand
                      opacity = 1;
                    } else if (entry.isToday) {
                      fillColor = theme === 'dark' ? "#3B82F6" : "#60A5FA"; // Blue for today
                      opacity = 1;
                    } else {
                      fillColor = "#64748b"; // Slate for past
                      opacity = 1;
                    }
                  } else if (entry.isToday) {
                    fillColor = theme === 'dark' ? "#3B82F6" : "#BFDBFE";
                    opacity = 0.9;
                  } else if (entry.isFuture) {
                    fillColor = "#3b82f6"; // Blue for future demand forecast
                    opacity = 0.6;
                  } else {
                    fillColor = "#94a3b8"; // Grey for past/observed
                    opacity = 0.6;
                  }
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fillColor}
                      opacity={opacity}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Activity, ChevronLeft, ChevronRight, Phone, Users, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router';
import { Activity, ChevronLeft, ChevronRight, Phone, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DailyBreakdownChartProps {
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onJumpToToday: () => void;
  staffingData?: Array<{ time: string; calls: number; agents: number }>;
  currentCallVolume?: number;
  currentRequiredAgents?: number;
  peakCallVolume?: number;
  peakRequiredAgents?: number;
  currentTimeSlot?: string;
  isToday?: boolean;
}

export function DailyBreakdownChart({ selectedDate, onPrevDay, onNextDay, onJumpToToday, staffingData, currentCallVolume, currentRequiredAgents, peakCallVolume, peakRequiredAgents, currentTimeSlot, isToday }: DailyBreakdownChartProps) {
  const { theme } = useTheme();
  
  // Check if selected date is today
  const isTodayMemo = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  // Check if selected date is in the past
  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  }, [selectedDate]);

  // Check if selected date is in the future
  const isFutureDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  }, [selectedDate]);

  // Current time state for the reference line
  const [currentTimeLabel, setCurrentTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    if (isTodayMemo) {
        const updateTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            // Round to nearest 30 min interval
            const roundedMinute = minute < 15 ? 0 : minute < 45 ? 30 : 60;
            let finalHour = hour;
            let finalMinute = roundedMinute;
            
            if (finalMinute === 60) {
                finalHour += 1;
                finalMinute = 0;
            }
            if (finalHour > 23) {
                setCurrentTimeLabel(null);
                return;
            }
            
            setCurrentTimeLabel(`${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 60000);
        
        return () => clearInterval(interval);
    } else {
        setCurrentTimeLabel(null);
    }
  }, [isTodayMemo]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const isToday = date.toDateString() === today.toDateString();
    
    return { dateString, isToday };
  };

  const isDark = theme === 'dark';

  // All available agents
  const allAgents = useMemo(() => [
    { name: 'Jackie Wang', status: 'Online' as const },
    { name: 'Sarah He', status: 'In Call' as const },
    { name: 'Hao Zhang', status: 'Break' as const },
    { name: 'Sophia Fang', status: 'Online' as const },
    { name: 'Michael Chen', status: 'In Call' as const },
    { name: 'Lisa Park', status: 'Online' as const },
    { name: 'David Liu', status: 'Break' as const },
    { name: 'Emily Zhang', status: 'Online' as const },
    { name: 'Ryan Kim', status: 'In Call' as const },
    { name: 'Jessica Wu', status: 'Online' as const },
    { name: 'Kevin Zhao', status: 'Break' as const },
    { name: 'Amy Lin', status: 'Online' as const },
    { name: 'Tom Martinez', status: 'In Call' as const },
    { name: 'Rachel Chang', status: 'Online' as const },
    { name: 'James Lee', status: 'Break' as const },
    { name: 'Anna Chen', status: 'Offline' as const },
    { name: 'Mark Johnson', status: 'Online' as const },
    { name: 'Lily Wang', status: 'In Call' as const },
    { name: 'Chris Lee', status: 'Break' as const },
    { name: 'Michelle Kim', status: 'Online' as const },
    { name: 'Daniel Park', status: 'Offline' as const },
    { name: 'Sophie Zhang', status: 'In Call' as const },
    { name: 'Alex Wu', status: 'Online' as const },
    { name: 'Grace Liu', status: 'Break' as const },
    { name: 'Eric Chen', status: 'Online' as const },
  ], []);

  // Get agents working at current time slot
  const currentAgents = useMemo(() => {
    if (!currentRequiredAgents || currentRequiredAgents === 0) return [];
    
    // Select the first N agents based on required count
    // In a real system, this would be based on actual schedules
    const count = Math.min(currentRequiredAgents, allAgents.length);
    return allAgents.slice(0, count);
  }, [currentRequiredAgents, allAgents]);

  const getStatusColor = (status: 'Online' | 'In Call' | 'Break' | 'Offline') => {
    switch (status) {
      case 'Online':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700';
      case 'In Call':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'Break':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'Offline':
        return 'bg-slate-100 dark:bg-slate-700/30 text-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-600';
    }
  };

  // Enhanced staffing data with past/future flags
  const enhancedStaffingData = useMemo(() => {
    if (!staffingData) return [];
    
    if (isPastDate) {
      // All data is observed for past dates
      return staffingData.map(slot => ({ ...slot, isPast: true, isFuture: false }));
    } else if (isFutureDate) {
      // All data is forecasted for future dates
      return staffingData.map(slot => ({ ...slot, isPast: false, isFuture: true }));
    } else if (isTodayMemo) {
      // For today, split based on current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return staffingData.map(slot => {
        // Parse time slot (e.g., "09:00" or "14:30")
        const [hourStr, minuteStr] = slot.time.split(':');
        const slotHour = parseInt(hourStr);
        const slotMinute = parseInt(minuteStr);
        
        // Compare with current time
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        return {
          ...slot,
          isPast: slotTimeInMinutes < currentTimeInMinutes,
          isFuture: slotTimeInMinutes >= currentTimeInMinutes,
          // For today, create separate data keys for past and future
          callsPast: slotTimeInMinutes < currentTimeInMinutes ? slot.calls : null,
          callsFuture: slotTimeInMinutes >= currentTimeInMinutes ? slot.calls : null,
          agentsPast: slotTimeInMinutes < currentTimeInMinutes ? slot.agents : null,
          agentsFuture: slotTimeInMinutes >= currentTimeInMinutes ? slot.agents : null,
        };
      });
    }
    
    return staffingData.map(slot => ({ ...slot, isPast: false, isFuture: false }));
  }, [staffingData, isPastDate, isFutureDate, isTodayMemo]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dataType = data.isFuture ? 'Forecast' : 'Observed';
      
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{data.time}</p>
            {(isPastDate || isFutureDate || (isTodayMemo && (data.isPast || data.isFuture))) && (
              <span className={`text-[10px] leading-none px-1.5 py-0.5 rounded font-medium ${
                data.isFuture 
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}>
                {dataType}
              </span>
            )}
          </div>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-w-0 min-h-[400px]">
      <style>{`
        .recharts-wrapper {
          outline: none !important;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Demand & Staffing Forecast</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(selectedDate).dateString}
              </span>
              {formatDate(selectedDate).isToday && (
                <span className="text-[10px] leading-none bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                  Today
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isTodayMemo && (
            <button
              onClick={onJumpToToday}
              className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-blue-600 dark:text-blue-400 flex items-center space-x-1 mr-1 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title="Jump to Today"
            >
              <span className="text-xs font-semibold px-1">Today</span>
            </button>
          )}
          <button
            onClick={onPrevDay}
            className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextDay}
            className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Stats Display */}
      {currentCallVolume !== undefined && currentRequiredAgents !== undefined && (
        <div className="flex justify-center mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ width: 'calc(100% - 130px)' }}>
            {/* Current Call Volume */}
            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isToday ? 'Current Call Volume' : 'Call Volume'}
                  </span>
                </div>
                {isToday && currentTimeSlot && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{currentTimeSlot}</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {currentCallVolume}
                </p>
                <span className="text-sm text-slate-500 dark:text-slate-400">calls/30min</span>
              </div>
              {peakCallVolume !== undefined && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Daily maximum: {peakCallVolume}</p>
              )}
            </div>

            {/* Required Agents */}
            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isToday ? 'Required Agents' : 'Required Agents'}
                  </span>
                </div>
                {isToday && currentTimeSlot && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{currentTimeSlot}</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {currentRequiredAgents}
                </p>
                <span className="text-sm text-slate-500 dark:text-slate-400">agents</span>
              </div>
              {peakRequiredAgents !== undefined && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Daily maximum: {peakRequiredAgents}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="w-full" style={{ height: '350px', minHeight: '350px' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
          <ComposedChart 
            data={enhancedStaffingData} 
            margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              {/* Gradient for observed call volume (black) */}
              <linearGradient id="colorCallsObserved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#1e293b' : '#000000'} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isDark ? '#1e293b' : '#000000'} stopOpacity={0}/>
              </linearGradient>
              {/* Gradient for forecasted call volume (blue - demand) */}
              <linearGradient id="colorCallsForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#334155' : '#e2e8f0'} 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#64748b' : '#94a3b8'}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              tickFormatter={(value, index) => {
                // Show fewer labels to avoid crowding
                if (index % 4 === 0) {
                  return value;
                }
                return '';
              }}
            />
            {/* Left Y-axis for calls */}
            <YAxis 
              yAxisId="left"
              stroke={isFutureDate ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#1e293b' : '#000000')}
              tick={{ fill: isFutureDate ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#1e293b' : '#000000'), fontSize: 12 }}
              label={{ 
                value: 'Calls', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: isFutureDate ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#1e293b' : '#000000'), fontSize: 12 }
              }}
            />
            {/* Right Y-axis for agents */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={isFutureDate ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#64748b' : '#94a3b8')}
              tick={{ fill: isFutureDate ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#64748b' : '#94a3b8'), fontSize: 12 }}
              label={{ 
                value: 'Agents', 
                angle: 90, 
                position: 'insideRight',
                style: { fill: isFutureDate ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#64748b' : '#94a3b8'), fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
              content={() => (
                <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                  {isPastDate && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#000000', opacity: 0.8 }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Call Volume (Observed)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#64748b' : '#94a3b8' }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Required Agents (Observed)</span>
                      </div>
                    </>
                  )}
                  {isFutureDate && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#60a5fa' : '#3b82f6', opacity: 0.8 }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Call Volume (Demand - Forecast)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#a78bfa' : '#8b5cf6' }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Required Agents (Supply - Forecast)</span>
                      </div>
                    </>
                  )}
                  {isTodayMemo && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#000000', opacity: 0.8 }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Past Demand (Observed)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#60a5fa' : '#3b82f6', opacity: 0.8 }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Future Demand (Forecast)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#64748b' : '#94a3b8' }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Past Supply (Observed)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: isDark ? '#a78bfa' : '#8b5cf6' }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Future Supply (Forecast)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-3 border-l-2" style={{ borderColor: '#f59e0b', borderStyle: 'dashed' }}></div>
                        <span className="text-slate-600 dark:text-slate-400">Current Time</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            />
            {isToday && currentTimeLabel && (
              <ReferenceLine 
                x={currentTimeLabel} 
                yAxisId="left"
                stroke={isDark ? '#f59e0b' : '#f59e0b'} 
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ 
                  value: 'Now', 
                  position: 'top',
                  fill: isDark ? '#f59e0b' : '#f59e0b',
                  fontSize: 11,
                  fontWeight: 600,
                  offset: 5
                }}
                ifOverflow="extendDomain"
              />
            )}
            {/* Call Volume Area - use different styling based on whether date is past/present/future */}
            {!isTodayMemo && (
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="calls" 
                name="Call Volume"
                stroke={isFutureDate ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#1e293b' : '#000000')}
                strokeWidth={3}
                strokeDasharray={isFutureDate ? "5 5" : "0"}
                fill={isFutureDate ? "url(#colorCallsForecast)" : "url(#colorCallsObserved)"}
              />
            )}
            {/* For today, show both past (black) and future (blue) as separate series */}
            {isTodayMemo && (
              <>
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="callsPast" 
                  name="Call Volume (Past)"
                  stroke={isDark ? '#1e293b' : '#000000'}
                  strokeWidth={3}
                  fill="url(#colorCallsObserved)"
                  connectNulls={false}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="callsFuture" 
                  name="Call Volume (Future)"
                  stroke={isDark ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="url(#colorCallsForecast)"
                  connectNulls={false}
                />
              </>
            )}
            {/* Required Agents Bar Chart - grey for past, purple for future */}
            {!isTodayMemo && (
              <Bar 
                yAxisId="right"
                dataKey="agents" 
                name="Required Agents"
                fill={isFutureDate ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#64748b' : '#94a3b8')}
                opacity={0.7}
                maxBarSize={20}
                radius={[2, 2, 0, 0]}
              />
            )}
            {/* For today, show both past (grey) and future (purple) as separate series */}
            {isTodayMemo && (
              <>
                <Bar 
                  yAxisId="right"
                  dataKey="agentsPast" 
                  name="Required Agents (Past)"
                  fill={isDark ? '#64748b' : '#94a3b8'}
                  opacity={0.7}
                  maxBarSize={20}
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="agentsFuture" 
                  name="Required Agents (Future)"
                  fill={isDark ? '#a78bfa' : '#8b5cf6'}
                  opacity={0.7}
                  maxBarSize={20}
                  radius={[2, 2, 0, 0]}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Assignments */}
      {isToday && currentAgents.length > 0 && (
        <div className="mt-6 p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Agents Scheduled for {currentTimeSlot}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({currentAgents.length} {currentAgents.length === 1 ? 'agent' : 'agents'})
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {currentAgents.map((agent, idx) => (
              <Link 
                key={idx}
                to={`/agent/${encodeURIComponent(agent.name)}`}
                className={`p-3 rounded-lg border backdrop-blur-sm transition-all hover:shadow-md cursor-pointer ${getStatusColor(agent.status)}`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{agent.name}</p>
                    <p className="text-xs opacity-75">{agent.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Agent Assignments for Past/Future dates */}
      {!isToday && staffingData && staffingData.length > 0 && (
        <div className="mt-6 p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isPastDate ? 'Agents Who Worked' : 'Agents Scheduled'} on {formatDate(selectedDate).dateString}
            </h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Peak staffing: <span className="font-bold text-purple-600 dark:text-purple-400">{peakRequiredAgents} agents</span> required
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {allAgents.slice(0, peakRequiredAgents || 10).map((agent, idx) => (
                <Link 
                  key={idx}
                  to={`/agent/${encodeURIComponent(agent.name)}`}
                  className="p-3 rounded-lg border backdrop-blur-sm bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-300">{agent.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
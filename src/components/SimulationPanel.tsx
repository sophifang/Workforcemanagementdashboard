import React, { useState, useEffect } from 'react';
import { Users, Calculator, ArrowRight, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationPanelProps {
  initialCallVolume?: number;
  onReset?: () => void;
}

export function SimulationPanel({ initialCallVolume, onReset }: SimulationPanelProps) {
  const [agentCount, setAgentCount] = useState(45);
  const [callVolume, setCallVolume] = useState(1200); // calls per hour
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Update call volume if external prop changes
  useEffect(() => {
    if (initialCallVolume) {
        setCallVolume(initialCallVolume);
    }
  }, [initialCallVolume]);

  // Simulation results state
  const [metrics, setMetrics] = useState({
    sla: 94,
    waitTime: 45,
    occupancy: 82
  });

  // Mock Erlang-C like calculation
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      // Simple heuristic logic for demonstration
      // Base load ~ 40 agents for 1200 calls/hr
      const baseAgents = callVolume / 30; 
      const surplus = agentCount - baseAgents;
      
      let newSla = 80 + (surplus * 2.5);
      newSla = Math.min(99.9, Math.max(10, newSla)); // Clamp 10-99.9%
      
      let newWait = 60 - (surplus * 8);
      newWait = Math.max(5, newWait); // Min 5 seconds
      
      let newOccupancy = 100 * (baseAgents / agentCount);
      newOccupancy = Math.min(100, Math.max(40, newOccupancy));

      setMetrics({
        sla: Number(newSla.toFixed(1)),
        waitTime: Math.round(newWait),
        occupancy: Math.round(newOccupancy)
      });
      setIsCalculating(false);
    }, 400); // Small delay for effect
    return () => clearTimeout(timer);
  }, [agentCount, callVolume]);

  const handleReset = () => {
      // Reset local state
      setAgentCount(45);
      if (initialCallVolume) {
          setCallVolume(initialCallVolume);
      }
      // Notify parent to reset date/charts
      if (onReset) {
          onReset();
      }
  };

  const getSlaColor = (val: number) => {
    if (val >= 90) return 'text-green-600 dark:text-green-400';
    if (val >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getWaitTimeColor = (val: number) => {
    if (val < 30) return 'text-green-600 dark:text-green-400'; // Target < 30s
    if (val <= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getOccupancyColor = (val: number) => {
      if (val >= 70 && val <= 85) return 'text-green-600 dark:text-green-400'; // Target 70-85
      if ((val >= 60 && val < 70) || (val > 85 && val <= 90)) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
  };

  // Recommendations
  const getSlaRecommendation = (sla: number) => {
      if (sla < 90) return "Increase agent supply to boost service level.";
      return null;
  };

  const getWaitTimeRecommendation = (wait: number) => {
      if (wait > 30) return "Reduce call volume or add agents to lower wait times.";
      return null;
  };

  const getOccupancyRecommendation = (occ: number) => {
      if (occ > 85) return "Agents are overworked. Consider increasing supply.";
      if (occ < 70) return "Agents are underutilized. You can reduce supply.";
      return null;
  };

  return (
    <div 
        style={{
            background: 'rgba(255, 255, 255, 0.10)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)'
        }}
        className="backdrop-blur-xl p-6 rounded-xl h-full flex flex-col border border-slate-100 dark:border-slate-700 dark:bg-slate-800/50"
    >
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Performance Simulator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Forecast metrics based on supply</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent Supply</label>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                {agentCount} Agents
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={agentCount}
              onChange={(e) => setAgentCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
              <span>Low Coverage</span>
              <span>High Coverage</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Call Volume / Hr</label>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {callVolume} Calls
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="2000"
              step="50"
              value={callVolume}
              onChange={(e) => setCallVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 dark:accent-slate-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 my-4"></div>

        {/* Results */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-500 dark:text-slate-200 font-medium">Predicted SLA</span>
              <AnimatePresence mode="wait">
                  <motion.span 
                    key={metrics.sla}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-lg font-bold ${getSlaColor(metrics.sla)}`}
                  >
                    {metrics.sla}%
                  </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 dark:text-slate-500 mb-2">Target: &gt;90%</span>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                <motion.div 
                  className={`h-1.5 rounded-full ${metrics.sla >= 90 ? 'bg-green-500' : metrics.sla >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  animate={{ width: `${metrics.sla}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </div>
              {getSlaRecommendation(metrics.sla) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-1.5 mt-1"
                  >
                      <TrendingUp className="w-3 h-3 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic leading-tight">
                        {getSlaRecommendation(metrics.sla)}
                      </span>
                  </motion.div>
              )}
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border border-slate-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-200 font-medium">Avg. Wait Time</span>
              <motion.span 
                   key={metrics.waitTime}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className={`text-lg font-bold ${getWaitTimeColor(metrics.waitTime)}`}
                 >
                  {metrics.waitTime}s
              </motion.span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1 mb-1">Target: &lt;30s</span>
             {getWaitTimeRecommendation(metrics.waitTime) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-1.5 mt-1"
                  >
                      <AlertTriangle className="w-3 h-3 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic leading-tight">
                        {getWaitTimeRecommendation(metrics.waitTime)}
                      </span>
                  </motion.div>
              )}
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border border-slate-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-200 font-medium">Agent Occupancy</span>
              <motion.span 
                     key={metrics.occupancy}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className={`text-lg font-bold ${getOccupancyColor(metrics.occupancy)}`}
                >
                  {metrics.occupancy}%
              </motion.span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1 mb-1">Target: 70-85%</span>
             {getOccupancyRecommendation(metrics.occupancy) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-1.5 mt-1"
                  >
                      <TrendingDown className="w-3 h-3 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic leading-tight">
                        {getOccupancyRecommendation(metrics.occupancy)}
                      </span>
                  </motion.div>
              )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
            onClick={handleReset}
            className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
        >
           <RefreshCw className="w-4 h-4" />
           <span>Reset to Current</span>
        </button>
      </div>
    </div>
  );
}

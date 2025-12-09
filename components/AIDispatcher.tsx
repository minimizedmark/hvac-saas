'use client';

import { useState, useEffect, useRef } from 'react';
import { TECHS, JOBS } from '@/lib/demoData';

interface DispatchDecision {
  timestamp: string;
  reasoning: string;
  actions: DispatchAction[];
  emergencies?: EmergencyEvent[];
  completions?: JobCompletion[];
}

interface DispatchAction {
  techId: number;
  techName: string;
  action: 'move' | 'dispatch' | 'complete' | 'standby';
  destination?: { lat: number; lng: number };
  jobDetails?: string;
  eta?: number;
}

interface EmergencyEvent {
  id: string;
  type: 'no_heat' | 'no_cooling' | 'gas_leak' | 'system_failure';
  location: { lat: number; lng: number };
  address: string;
  severity: 'critical' | 'high' | 'normal';
  customer: string;
}

interface JobCompletion {
  techId: number;
  jobId: string;
  outcome: 'completed' | 'needs_parts' | 'escalated';
  nextAction: string;
}

interface AIDispatcherProps {
  onTechUpdate: (techId: number, updates: any) => void;
  onNewJob?: (job: any) => void;
  onJobComplete?: (jobId: string) => void;
}

export default function AIDispatcher({ onTechUpdate, onNewJob, onJobComplete }: AIDispatcherProps) {
  const [isActive, setIsActive] = useState(false);
  const [decisions, setDecisions] = useState<DispatchDecision[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentContext, setCurrentContext] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Main agentic loop - runs every 15 seconds
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const runAgenticCycle = async () => {
      setIsThinking(true);
      
      try {
        // Step 1: Gather current state
        const context = gatherFleetContext();
        setCurrentContext(context);

        // Step 2: Call Claude API for dispatch decisions
        const decision = await getClaudeDispatchDecision(context);

        // Step 3: Execute actions
        executeDispatchActions(decision);

        // Step 4: Log decision
        setDecisions(prev => [decision, ...prev].slice(0, 10)); // Keep last 10

      } catch (error) {
        console.error('AI Dispatcher error:', error);
      } finally {
        setIsThinking(false);
      }
    };

    // Run immediately, then every 15 seconds
    runAgenticCycle();
    intervalRef.current = setInterval(runAgenticCycle, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  // Gather current fleet state for Claude context
  const gatherFleetContext = (): string => {
    const techStatus = TECHS.map(tech => ({
      id: tech.id,
      name: tech.name,
      status: tech.status,
      location: tech.currentPosition,
      currentJob: tech.currentJob,
      eta: tech.eta
    }));

    const activeJobs = JOBS.filter(job => job.status !== 'completed');

    const context = `
CURRENT TIME: ${new Date().toLocaleTimeString()}
EDMONTON HVAC FLEET STATUS:

TECHNICIANS:
${techStatus.map(t => `- ${t.name}: ${t.status} ${t.currentJob ? `(${t.currentJob})` : '(Available)'} ${t.eta ? `ETA ${t.eta}min` : ''}`).join('\n')}

ACTIVE JOBS:
${activeJobs.map(j => `- ${j.priority.toUpperCase()}: ${j.type} at ${j.address} (Assigned: ${j.assignedTo || 'Unassigned'})`).join('\n')}

DISPATCH RULES:
- Minimize drive time and fuel costs
- Emergency calls (no heat/cooling) get priority
- Keep at least 1 tech available for emergencies
- Complete jobs before assigning new ones when possible
- Consider Edmonton traffic patterns
- Generate realistic emergency events occasionally (5-10% chance)
- Mark jobs complete when techs have been on-site for realistic duration
    `.trim();

    return context;
  };

  // Call Claude API with agentic prompt
  const getClaudeDispatchDecision = async (context: string): Promise<DispatchDecision> => {
    // TODO: This will be replaced with actual Claude API call
    // For now, return mock decision structure
    
    const mockDecision: DispatchDecision = {
      timestamp: new Date().toISOString(),
      reasoning: "Analyzing fleet efficiency... Mike Rodriguez nearing job completion on Gateway Blvd. Steve Martinez 15 minutes from Stony Plain Rd installation. No emergencies detected. Maintaining one available tech (Carlos) for dispatch readiness.",
      actions: [
        {
          techId: 1,
          techName: "Mike Rodriguez",
          action: "move",
          destination: { lat: 53.5200, lng: -113.4950 },
          eta: 3
        }
      ]
    };

    return mockDecision;
  };

  // Execute the AI's dispatch decisions
  const executeDispatchActions = (decision: DispatchDecision) => {
    decision.actions.forEach(action => {
      switch (action.action) {
        case 'move':
          if (action.destination) {
            onTechUpdate(action.techId, {
              currentPosition: action.destination,
              status: 'en-route',
              eta: action.eta
            });
          }
          break;

        case 'dispatch':
          onTechUpdate(action.techId, {
            status: 'en-route',
            currentJob: action.jobDetails,
            eta: action.eta
          });
          break;

        case 'complete':
          onTechUpdate(action.techId, {
            status: 'available',
            currentJob: undefined,
            eta: undefined
          });
          if (onJobComplete) {
            onJobComplete(action.jobDetails || '');
          }
          break;

        case 'standby':
          onTechUpdate(action.techId, {
            status: 'available'
          });
          break;
      }
    });

    // Handle emergency events
    if (decision.emergencies && onNewJob) {
      decision.emergencies.forEach(emergency => {
        onNewJob({
          id: emergency.id,
          type: emergency.type,
          address: emergency.address,
          priority: emergency.severity,
          customer: emergency.customer,
          status: 'pending'
        });
      });
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
          <h2 className="text-white font-semibold">AI Dispatcher</h2>
          {isThinking && (
            <span className="text-xs text-blue-400 animate-pulse">Thinking...</span>
          )}
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isActive ? 'Stop AI' : 'Start AI'}
        </button>
      </div>

      {/* Current Context */}
      {isActive && (
        <div className="mb-4 p-3 bg-gray-800 rounded text-xs">
          <div className="text-gray-400 mb-1">Fleet Context:</div>
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-[10px] overflow-auto max-h-24">
            {currentContext}
          </pre>
        </div>
      )}

      {/* Decision Feed */}
      <div className="flex-1 overflow-auto space-y-3">
        {decisions.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">
            {isActive ? 'Waiting for first AI decision...' : 'Start AI to begin autonomous dispatch'}
          </div>
        )}

        {decisions.map((decision, idx) => (
          <div key={idx} className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">
              {new Date(decision.timestamp).toLocaleTimeString()}
            </div>
            
            {/* AI Reasoning */}
            <div className="text-sm text-gray-300 mb-3 italic">
              "{decision.reasoning}"
            </div>

            {/* Actions Taken */}
            <div className="space-y-2">
              {decision.actions.map((action, actionIdx) => (
                <div key={actionIdx} className="text-xs bg-gray-900 rounded p-2 border-l-2 border-blue-500">
                  <span className="text-blue-400 font-semibold">{action.techName}</span>
                  <span className="text-gray-400"> → </span>
                  <span className="text-white">{action.action.toUpperCase()}</span>
                  {action.destination && (
                    <span className="text-gray-400"> to {action.destination.lat.toFixed(4)}, {action.destination.lng.toFixed(4)}</span>
                  )}
                  {action.eta && (
                    <span className="text-orange-400"> (ETA {action.eta}min)</span>
                  )}
                </div>
              ))}

              {/* Emergency Events */}
              {decision.emergencies && decision.emergencies.map((emergency, eIdx) => (
                <div key={eIdx} className="text-xs bg-red-900/20 rounded p-2 border-l-2 border-red-500">
                  <span className="text-red-400 font-semibold">🚨 EMERGENCY:</span>
                  <span className="text-white"> {emergency.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-gray-400"> at {emergency.address}</span>
                </div>
              ))}

              {/* Job Completions */}
              {decision.completions && decision.completions.map((completion, cIdx) => (
                <div key={cIdx} className="text-xs bg-green-900/20 rounded p-2 border-l-2 border-green-500">
                  <span className="text-green-400 font-semibold">✓ COMPLETED:</span>
                  <span className="text-white"> {completion.jobId}</span>
                  <span className="text-gray-400"> - {completion.nextAction}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

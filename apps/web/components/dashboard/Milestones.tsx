'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface MilestonesProps {
  connectedApps: number;
  hasPolicies: boolean;
  hasProxyUsage: boolean;
}

interface MilestoneItemProps {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  isCurrent: boolean;
}

function MilestoneItem({ step, title, description, completed, isCurrent }: MilestoneItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 mt-1">
        {completed ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        ) : isCurrent ? (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
            <Circle className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <Circle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              completed ? 'text-green-600 dark:text-green-400' :
              isCurrent ? 'text-blue-600 dark:text-blue-400' :
              'text-gray-500 dark:text-gray-400'
            }`}
          >
            Step {step}: {title}
          </span>
          {completed && (
            <span className="text-xs text-green-600 dark:text-green-400">✅ Done</span>
          )}
          {isCurrent && !completed && (
            <span className="text-xs text-blue-600 dark:text-blue-400">⏳ In progress</span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}

export function Milestones({ connectedApps, hasPolicies, hasProxyUsage }: MilestonesProps) {
  const milestones = [
    {
      step: 1,
      title: 'Connect AI Apps',
      description: 'Connect OpenAI, Claude, Midjourney, and Replicate accounts',
      completed: connectedApps >= 1,
      isCurrent: connectedApps === 0,
    },
    {
      step: 2,
      title: 'Set Up Policies',
      description: 'Track rollover policies and soft expiry windows',
      completed: hasPolicies,
      isCurrent: connectedApps > 0 && !hasPolicies,
    },
    {
      step: 3,
      title: 'Start Using Proxy',
      description: 'Proxy requests and deduct credits automatically',
      completed: hasProxyUsage,
      isCurrent: connectedApps > 0 && hasPolicies && !hasProxyUsage,
    },
  ];

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progress = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🎯 Next Milestones</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedMilestones}/{totalMilestones} complete
          </span>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <MilestoneItem key={index} {...milestone} />
        ))}
      </div>
      {completedMilestones === totalMilestones && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
            🎉 All milestones complete! You're ready to use the Credit Bank.
            <ArrowRight className="w-4 h-4" />
          </p>
        </div>
      )}
    </div>
  );
}
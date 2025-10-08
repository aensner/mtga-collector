import React from 'react';
import type { AccuracyMetrics as AccuracyMetricsType } from '../../types';

interface AccuracyMetricsProps {
  metrics: AccuracyMetricsType;
}

export const AccuracyMetrics: React.FC<AccuracyMetricsProps> = ({ metrics }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4">Accuracy Report</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Name Accuracy</div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.nameAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {metrics.exactNameMatches} exact, {metrics.fuzzyNameMatches} fuzzy
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Quantity Accuracy</div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.quantityAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {metrics.quantityMatches} / {metrics.totalCards} correct
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Overall Accuracy</div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.overallAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {metrics.totalCards} total cards
          </div>
        </div>
      </div>

      {metrics.errors.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-900 px-4 py-3">
            <h4 className="text-sm font-medium text-white">
              Errors ({metrics.errors.length})
            </h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-900 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Position</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Expected</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {metrics.errors.map((error, index) => (
                  <tr key={index} className="hover:bg-gray-700/50">
                    <td className="px-4 py-2 text-sm text-gray-300">
                      ({error.position.x}, {error.position.y})
                    </td>
                    <td className="px-4 py-2 text-sm text-green-400">
                      {error.expected}
                    </td>
                    <td className="px-4 py-2 text-sm text-red-400">
                      {error.actual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

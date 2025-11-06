import React from 'react';
import type { View } from '../types';

interface ViewSelectorProps {
  allViews: readonly View[];
  selectedViews: View[];
  onSelectionChange: (view: View, isSelected: boolean) => void;
  disabled: boolean;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ allViews, selectedViews, onSelectionChange, disabled }) => {
  return (
    <div className="my-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <h3 className="text-lg font-semibold text-center text-gray-300 mb-4">Select Views to Generate</h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {allViews.map((view) => {
          const isSelected = selectedViews.includes(view);
          return (
            <label
              key={view}
              className={`
                flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200
                border-2 
                ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-indigo-500 hover:bg-gray-700'}
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={(e) => onSelectionChange(view, e.target.checked)}
                disabled={disabled}
                aria-label={`Select ${view} view`}
              />
              <span className="font-medium select-none text-sm">{view}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
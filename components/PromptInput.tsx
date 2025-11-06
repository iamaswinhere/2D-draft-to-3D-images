import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="my-6">
      <label htmlFor="additional-prompt" className="block text-lg font-semibold text-gray-300 mb-2 text-center">
        Add Details (Optional)
      </label>
      <p className="text-center text-sm text-gray-500 mb-4">
        Provide extra context like materials, colors, or environment to improve the 3D generation.
      </p>
      <textarea
        id="additional-prompt"
        rows={3}
        className="w-full bg-gray-800/70 border-2 border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:opacity-50"
        placeholder="e.g., 'A modern office chair with chrome legs and black leather upholstery, under bright studio lighting.'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

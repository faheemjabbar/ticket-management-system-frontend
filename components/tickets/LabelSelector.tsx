'use client';

import { useState, useEffect } from 'react';
import { useLabels } from '@/hooks/useLabels';
import LabelBadge from '@/components/ui/LabelBadge';
import { Plus, Search } from 'lucide-react';
import type { Label } from '@/types/label.types';

interface LabelSelectorProps {
  projectId: string;
  selectedLabelIds: string[];
  onChange: (labelIds: string[]) => void;
  disabled?: boolean;
}

export default function LabelSelector({ projectId, selectedLabelIds, onChange, disabled }: LabelSelectorProps) {
  const { labels, loading } = useLabels(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLabels = labels.filter(l => selectedLabelIds.includes(l.id));
  const availableLabels = labels.filter(l => !selectedLabelIds.includes(l.id));
  
  const filteredLabels = availableLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLabel = (labelId: string) => {
    onChange([...selectedLabelIds, labelId]);
    setSearchTerm('');
  };

  const handleRemoveLabel = (labelId: string) => {
    onChange(selectedLabelIds.filter(id => id !== labelId));
  };

  if (loading) {
    return <div className="text-xs text-gray-500">Loading labels...</div>;
  }

  return (
    <div className="space-y-2">
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.id}
              name={label.name}
              color={label.color}
              onRemove={() => handleRemoveLabel(label.id)}
            />
          ))}
        </div>
      )}

      {/* Add Label Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Label
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded shadow-lg z-20">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search labels..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Label List */}
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredLabels.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    {searchTerm ? 'No labels found' : 'No more labels available'}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredLabels.map((label) => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => {
                          handleAddLabel(label.id);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors text-left"
                      >
                        <LabelBadge name={label.name} color={label.color} />
                        {label.description && (
                          <span className="text-[10px] text-gray-500 ml-2 truncate">
                            {label.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

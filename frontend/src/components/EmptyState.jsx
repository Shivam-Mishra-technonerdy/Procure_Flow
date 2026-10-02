import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items matching your current view or filters.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-[#E2E5E9]">
      <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] flex items-center justify-center mb-3 text-[#667085]">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-[#263238] mb-1">{title}</h3>
      <p className="text-xs text-[#667085] max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

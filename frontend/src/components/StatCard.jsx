import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, trend = 'up', color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-[#EAF2FA] text-[#2563A6] border-[#D0E2F5]',
    navy: 'bg-[#172B4D]/10 text-[#172B4D] border-[#172B4D]/20',
    sky: 'bg-[#EAF2FA] text-[#2563A6] border-[#D0E2F5]',
    emerald: 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9]',
    green: 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9]',
    sage: 'bg-[#EDF5F0] text-[#3F7D5A] border-[#D1E7D9]',
    amber: 'bg-[#FCF7ED] text-[#B9852C] border-[#F5E6CC]',
    purple: 'bg-[#F8F9FA] text-[#667085] border-[#E2E5E9]',
    slate: 'bg-[#F8F9FA] text-[#667085] border-[#E2E5E9]',
    rose: 'bg-[#FDF2F2] text-[#B84C4C] border-[#F8D7DA]',
    crimson: 'bg-[#FDF2F2] text-[#B84C4C] border-[#F8D7DA]',
  };

  const supportingText = change || (typeof trend === 'string' && trend !== 'up' && trend !== 'down' ? trend : null);
  const isPositive = typeof trend === 'string' && (trend.startsWith('+') || trend === 'up');

  return (
    <div className="bg-white rounded-xl border border-[#E2E5E9] p-5 shadow-xs hover:border-[#2563A6]/40 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] truncate">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-[#263238] tracking-tight mt-1 truncate">
            {value}
          </h3>
          {supportingText && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 truncate ${
              isPositive ? 'text-[#3F7D5A]' : 'text-[#667085]'
            }`}>
              {isPositive ? '↑' : '•'} <span>{supportingText}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border flex-shrink-0 ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

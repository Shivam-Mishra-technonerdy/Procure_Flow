import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading data, please wait...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-10 h-10 rounded-lg bg-[#EAF2FA] flex items-center justify-center mb-3">
        <Loader2 className="w-5 h-5 text-[#2563A6] animate-spin" />
      </div>
      <p className="text-xs font-medium text-[#667085]">{message}</p>
    </div>
  );
};

export default LoadingState;

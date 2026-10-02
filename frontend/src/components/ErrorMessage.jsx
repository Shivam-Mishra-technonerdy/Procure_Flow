import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  message = 'An error occurred while fetching data.',
  onRetry = null,
}) => {
  return (
    <div className="p-4 bg-[#FDF2F2] border border-[#F8D7DA] rounded-xl flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-[#F8D7DA]/60 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-[#B84C4C]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#933737]">Something went wrong</h4>
          <p className="text-xs text-[#B84C4C] mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#F8D7DA] text-[#B84C4C] hover:bg-[#FDF2F2] rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

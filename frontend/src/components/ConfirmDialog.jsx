import React, { useState } from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'primary' | 'danger' | 'success'
  requireRemarks = false,
  remarksLabel = 'Reason / Remarks',
  remarksPlaceholder = 'Please enter remarks...',
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [remarks, setRemarks] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireRemarks && !remarks.trim()) {
      setValidationError('Remarks are mandatory for this action.');
      return;
    }
    setValidationError('');
    onConfirm(remarks);
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-[#B84C4C] hover:bg-[#933737] text-white shadow-xs';
      case 'success':
        return 'bg-[#3F7D5A] hover:bg-[#2F6144] text-white shadow-xs';
      default:
        return 'bg-[#2563A6] hover:bg-[#1E528B] text-white shadow-xs';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B4D]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#E2E5E9] overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                type === 'danger'
                  ? 'bg-[#FDF2F2] text-[#B84C4C] border border-[#F8D7DA]'
                  : type === 'success'
                  ? 'bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9]'
                  : 'bg-[#EAF2FA] text-[#2563A6] border border-[#D0E2F5]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#263238]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#667085] mb-4 leading-relaxed">{message}</p>

        {requireRemarks && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#263238] mb-1">
              {remarksLabel} <span className="text-[#B84C4C]">*</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder={remarksPlaceholder}
              className="w-full text-xs p-3 bg-[#F7F5F0] border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563A6] focus:bg-white text-[#263238] transition resize-none placeholder:text-[#667085]/60"
            />
            {validationError && (
              <p className="text-[11px] text-[#B84C4C] font-medium mt-1">{validationError}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#263238] hover:bg-[#F7F5F0] rounded-lg transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${getButtonStyles()}`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

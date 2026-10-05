import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-[#FCF7ED] text-[#8F651C] border-[#F3DCAC]',
    APPROVED: 'bg-[#EDF5F0] text-[#2F6144] border-[#C2E2CE]',
    DELIVERED: 'bg-[#EBF5EE] text-[#26533A] border-[#B2DAC1]',
    REJECTED: 'bg-[#FDF2F2] text-[#933737] border-[#F5C4C4]',
    CANCELLED: 'bg-[#F8F9FA] text-[#667085] border-[#E2E5E9]',
  };

  const labels = {
    PENDING: 'Pending Approval',
    APPROVED: 'Approved / In Fulfillment',
    DELIVERED: 'Delivered',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  };

  const currentStyle = styles[status] || 'bg-[#F8F9FA] text-[#667085] border-[#E2E5E9]';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${currentStyle}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
        status === 'DELIVERED' ? 'bg-[#3F7D5A]' :
        status === 'APPROVED' ? 'bg-[#3F7D5A]' :
        status === 'PENDING' ? 'bg-[#B9852C]' :
        status === 'REJECTED' ? 'bg-[#B84C4C]' : 'bg-[#667085]'
      }`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;

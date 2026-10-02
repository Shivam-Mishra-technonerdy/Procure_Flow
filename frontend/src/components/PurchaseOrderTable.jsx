import React from 'react';
import {
  FileText,
  FileDown,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  Calendar,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const PurchaseOrderTable = ({
  orders = [],
  loading = false,
  onViewOrder,
  onDownloadPdf,
  onApprove,
  onReject,
  onDeliver,
  showSupplierColumn = true,
  showBuyerColumn = true,
  emptyMessage = 'No purchase orders found.',
}) => {
  if (loading) {
    return <LoadingState message="Loading purchase orders..." />;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E5E9] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Order #</th>
              {showSupplierColumn && <th className="px-4 py-3">Supplier</th>}
              {showBuyerColumn && <th className="px-4 py-3">Buyer</th>}
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total Amount</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
            {orders.map((order) => {
              const supplierName =
                order.supplier?.name || order.supplierName || '—';
              const buyerName =
                order.buyer?.fullName || order.buyerName || order.createdBy?.fullName || '—';

              return (
                <tr
                  key={order.id}
                  className="hover:bg-[#F7F5F0]/60 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3 font-semibold text-[#263238]">
                    <button
                      onClick={() => onViewOrder && onViewOrder(order)}
                      className="hover:text-[#2563A6] transition flex items-center space-x-1.5 cursor-pointer font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#667085] group-hover:text-[#2563A6]" />
                      <span>{order.orderNumber || `PO #${order.id}`}</span>
                    </button>
                  </td>

                  {showSupplierColumn && (
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5 font-medium text-[#263238]">
                        <Building2 className="w-3.5 h-3.5 text-[#667085]" />
                        <span>{supplierName}</span>
                      </div>
                    </td>
                  )}

                  {showBuyerColumn && (
                    <td className="px-4 py-3 text-[#667085]">
                      <span>{buyerName}</span>
                    </td>
                  )}

                  <td className="px-4 py-3 text-[#667085]">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#667085]" />
                      <span>{formatDate(order.orderDate || order.createdAt)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-[#263238]">
                    <div>{formatCurrency(order.totalAmount, order.currencyCode)}</div>
                    {order.currencyCode && order.currencyCode !== 'INR' && (
                      <span className="text-[10px] text-[#667085] font-mono">({order.currencyCode})</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      {/* View details */}
                      <button
                        onClick={() => onViewOrder && onViewOrder(order)}
                        className="p-1.5 text-[#667085] hover:text-[#2563A6] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download PDF */}
                      {onDownloadPdf && (
                        <button
                          onClick={() => onDownloadPdf(order)}
                          className="p-1.5 text-[#667085] hover:text-[#3F7D5A] hover:bg-[#EDF5F0] rounded-md transition cursor-pointer"
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Approve action (Pending only) */}
                      {onApprove && order.status === 'PENDING' && (
                        <button
                          onClick={() => onApprove(order)}
                          className="p-1.5 text-[#2563A6] hover:text-[#1E528B] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
                          title="Approve Order"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Reject action (Pending only) */}
                      {onReject && order.status === 'PENDING' && (
                        <button
                          onClick={() => onReject(order)}
                          className="p-1.5 text-[#B84C4C] hover:text-[#933737] hover:bg-[#FDF2F2] rounded-md transition cursor-pointer"
                          title="Reject Order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Supplier Deliver action (Approved only) */}
                      {onDeliver && order.status === 'APPROVED' && (
                        <button
                          onClick={() => onDeliver(order)}
                          className="p-1.5 text-[#3F7D5A] hover:text-[#2F6144] hover:bg-[#EDF5F0] rounded-md transition cursor-pointer"
                          title="Mark as Delivered"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;

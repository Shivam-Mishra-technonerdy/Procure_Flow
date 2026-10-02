import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  FileSpreadsheet,
  Plus,
  Search,
  FileText,
  Check,
  XCircle,
  Truck,
  Eye,
  AlertCircle
} from 'lucide-react';

const Orders = () => {
  const { user, isAdmin, isBuyer, isSupplier } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await orderApi.getAll(statusParam);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleApprove = async (orderId) => {
    if (window.confirm('Are you sure you want to approve this purchase order?')) {
      try {
        await orderApi.updateStatus(orderId, { status: 'APPROVED' });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updated = await orderApi.getById(orderId);
          setSelectedOrder(updated.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Approval failed');
      }
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting this purchase order.');
      return;
    }
    try {
      await orderApi.updateStatus(rejectModalOrder.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      setRejectModalOrder(null);
      setRejectionReason('');
      fetchOrders();
      if (selectedOrder?.id === rejectModalOrder.id) {
        const updated = await orderApi.getById(rejectModalOrder.id);
        setSelectedOrder(updated.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleDeliver = async (orderId) => {
    if (window.confirm('Confirm order delivery? This will mark fulfillment as complete.')) {
      try {
        await orderApi.updateStatus(orderId, { status: 'DELIVERED' });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updated = await orderApi.getById(orderId);
          setSelectedOrder(updated.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Status update failed');
      }
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this purchase order?')) {
      try {
        await orderApi.updateStatus(orderId, { status: 'CANCELLED' });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updated = await orderApi.getById(orderId);
          setSelectedOrder(updated.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Cancellation failed');
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.supplierCompany?.toLowerCase().includes(q) ||
      o.buyerName?.toLowerCase().includes(q)
    );
  });

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'DELIVERED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track order approvals, vendor deliveries, line item details, and official PDF exports
          </p>
        </div>
        {(isBuyer || isAdmin) && (
          <Link
            to="/orders/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by PO #, Supplier, or Buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No purchase orders found</p>
            <p className="text-xs mt-1">Try selecting another status tab or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">PO Number</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Buyer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Grand Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Expected Delivery</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 font-mono text-xs block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{order.supplierCompany}</p>
                      <p className="text-xs text-slate-400">{order.supplierEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{order.buyerName}</p>
                      <p className="text-xs text-slate-400">{order.buyerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(order.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {order.expectedDeliveryDate || 'Flexible'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/orders/${order.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Download Purchase Order PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalOrder(order);
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {isSupplier && order.status === 'APPROVED' && (
                          <button
                            onClick={() => handleDeliver(order.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" /> Deliver
                          </button>
                        )}

                        {isBuyer && order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectModalOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-300" />
                <h3 className="text-base font-bold">Reject Purchase Order</h3>
              </div>
              <button onClick={() => setRejectModalOrder(null)} className="p-1 text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Rejecting <strong>{rejectModalOrder.orderNumber}</strong>. Please specify the reason:
              </p>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono">{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-slate-400">Order Details</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/orders/${selectedOrder.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Export</span>
                </a>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">✕</button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-medium">Status</span>
                  <div className="mt-1"><StatusBadge status={selectedOrder.status} /></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-medium">Grand Total</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">${Number(selectedOrder.grandTotal).toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-medium">Expected Date</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{selectedOrder.expectedDeliveryDate || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-medium">Actual Delivery</span>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">{selectedOrder.actualDeliveryDate || 'Pending'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Buyer</h4>
                  <p className="font-medium text-slate-800">{selectedOrder.buyerName}</p>
                  <p className="text-slate-500">{selectedOrder.buyerEmail}</p>
                  <p className="text-slate-500 mt-2"><strong>Ship To:</strong> {selectedOrder.deliveryAddress || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Supplier</h4>
                  <p className="font-medium text-slate-800">{selectedOrder.supplierCompany}</p>
                  <p className="text-slate-500">Contact: {selectedOrder.supplierName}</p>
                  <p className="text-slate-500">{selectedOrder.supplierEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Itemized Breakdown</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-3 text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-medium">{item.itemDescription}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold">${Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>${Number(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (8%):</span>
                    <span>${Number(selectedOrder.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-sky-700">${Number(selectedOrder.grandTotal).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1">Notes:</span>
                  <p className="text-slate-600">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                  <span className="font-semibold block mb-1">Rejection Reason:</span>
                  <p>{selectedOrder.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              {isAdmin && selectedOrder.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedOrder.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Approve Order
                  </button>
                  <button
                    onClick={() => {
                      setRejectModalOrder(selectedOrder);
                      setRejectionReason('');
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Reject Order
                  </button>
                </>
              )}

              {isSupplier && selectedOrder.status === 'APPROVED' && (
                <button
                  onClick={() => handleDeliver(selectedOrder.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Mark Delivered
                </button>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
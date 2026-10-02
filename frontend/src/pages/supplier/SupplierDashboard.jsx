import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Building2,
} from 'lucide-react';
import { orderApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import OrderDetailModal from '../../components/OrderDetailModal';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load assigned vendor orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  if (loading) {
    return <LoadingState message="Loading vendor fulfillment desk..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAssignedOrders} />;
  }

  const assignedCount = orders.length;
  const approvedCount = orders.filter((o) => o.status === 'APPROVED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .slice(0, 5);

  const supplierName =
    user?.supplierName || orders[0]?.supplier?.name || orders[0]?.supplierName || 'Apex Industrial Supplies';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-[#263238]">{supplierName}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EDF5F0] text-[#3F7D5A] border border-[#D1E7D9]">
              Authorized Vendor
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Fulfill purchase orders approved by enterprise buyers and register shipment deliveries
          </p>
        </div>

        {approvedCount > 0 && (
          <button
            onClick={() => navigate('/supplier/orders')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#2563A6] hover:bg-[#1E528B] text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{approvedCount} Ready for Delivery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Purchase Orders"
          value={assignedCount}
          icon={Package}
          color="blue"
          trend="Total routed orders"
        />
        <StatCard
          title="Ready for Delivery"
          value={approvedCount}
          icon={Truck}
          color="amber"
          trend={approvedCount > 0 ? 'Fulfillment in progress' : 'No pending shipments'}
        />
        <StatCard
          title="Successfully Delivered"
          value={deliveredCount}
          icon={CheckCircle2}
          color="sage"
          trend="Closed & fulfilled"
        />
        <StatCard
          title="Fulfilled Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="slate"
          trend="Completed deliveries"
        />
      </div>

      {/* Recent Assigned Orders Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E5E9] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#263238]">Recent Assigned Orders</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Orders assigned to your organization by procurement officers
            </p>
          </div>
          <button
            onClick={() => navigate('/supplier/orders')}
            className="text-xs font-semibold text-[#2563A6] hover:text-[#1E528B] flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Assigned Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Buyer Company</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Order Value</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-[#667085]">
                    No purchase orders currently assigned.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#263238]">
                      {order.orderNumber || `PO #${order.id}`}
                    </td>
                    <td className="px-4 py-3">
                      {order.buyer?.fullName || order.buyerName || order.createdBy?.fullName || 'Procurement Buyer'}
                    </td>
                    <td className="px-4 py-3 text-[#667085]">
                      {formatDate(order.orderDate || order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#263238]">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#2563A6] hover:bg-[#EAF2FA] rounded-md transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        currentUserRole="SUPPLIER"
      />
    </div>
  );
};

export default SupplierDashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportApi } from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  DollarSign,
  Truck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user, isAdmin, isBuyer, isSupplier } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load dashboard stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Doughnut Chart Data (Order Status Distribution)
  const doughnutData = {
    labels: ['Pending', 'Approved', 'Delivered', 'Rejected'],
    datasets: [
      {
        data: [
          stats?.statusDistribution?.Pending || 0,
          stats?.statusDistribution?.Approved || 0,
          stats?.statusDistribution?.Delivered || 0,
          stats?.statusDistribution?.Rejected || 0,
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e'],
        borderWidth: 0,
      },
    ],
  };

  // Bar Chart Data (Monthly Spending)
  const monthlyLabels = stats?.monthlySpending?.map((m) => m.month) || ['Jan', 'Feb', 'Mar'];
  const monthlyAmounts = stats?.monthlySpending?.map((m) => m.amount) || [1200, 3400, 2100];

  const barData = {
    labels: monthlyLabels.length ? monthlyLabels : ['Current Month'],
    datasets: [
      {
        label: 'Total Spend ($)',
        data: monthlyAmounts.length ? monthlyAmounts : [stats?.totalExpenditure || 0],
        backgroundColor: '#0284c7',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-sky-400 tracking-wider">
            {isAdmin ? 'System Administrator Portal' : isSupplier ? 'Supplier Operations Portal' : 'Procurement Buyer Portal'}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {isAdmin && 'Manage vendor directories, approve purchase orders, and monitor company-wide procurement workflows.'}
            {isSupplier && `Monitor active orders assigned to ${user?.supplierName || 'your vendor account'} and update fulfillment status.`}
            {isBuyer && 'Generate requisitions, submit purchase orders to approved suppliers, and track delivery progress.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(isBuyer || isAdmin) && (
            <Link
              to="/orders/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Order</span>
            </Link>
          )}
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={FileSpreadsheet}
          change="All-time volume"
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          change="Awaiting action"
          color="amber"
        />
        <StatCard
          title="Delivered"
          value={stats?.deliveredOrders || 0}
          icon={CheckCircle2}
          change="Completed shipments"
          color="emerald"
        />
        <StatCard
          title="Total Spend"
          value={`$${Number(stats?.totalExpenditure || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          change="Active purchase sum"
          color="purple"
        />
        <StatCard
          title="Active Suppliers"
          value={stats?.totalSuppliers || 0}
          icon={Truck}
          change="Verified partners"
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart: Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Order Status Breakdown</h3>
            <span className="text-xs text-slate-400">Live summary</span>
          </div>
          <div className="w-56 h-56 relative flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                },
                cutout: '70%',
              }}
            />
          </div>
        </div>

        {/* Bar Chart: Spending Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Procurement Expenditure</h3>
              <p className="text-xs text-slate-400">Monthly spend aggregation</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> USD
            </span>
          </div>
          <div className="h-60">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (val) => `$${val}` },
                    grid: { color: '#f1f5f9' },
                  },
                  x: { grid: { display: false } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Purchase Orders</h3>
            <p className="text-xs text-slate-400">Latest requisitions in workflow</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">PO Number</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Buyer</th>
                <th className="px-6 py-3.5">Grand Total</th>
                <th className="px-6 py-3.5">Expected Delivery</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No orders created yet.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{order.supplierCompany}</p>
                      <p className="text-xs text-slate-400">{order.supplierName}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.buyerName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${Number(order.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {order.expectedDeliveryDate || 'Flexible'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/orders/${order.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Download PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/orders`}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
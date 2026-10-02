import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { reportApi, orderApi, supplierApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersRes, suppliersRes, reportRes] = await Promise.all([
        orderApi.getAll().catch(() => ({ data: [] })),
        supplierApi.getAll().catch(() => ({ data: [] })),
        reportApi.getDashboardStats().catch(() => ({ data: null })),
      ]);

      const allOrders = ordersRes.data || [];
      const allSuppliers = suppliersRes.data || [];
      setOrders(allOrders);
      setSuppliers(allSuppliers);

      const statusMap = { PENDING: 0, APPROVED: 0, DELIVERED: 0, REJECTED: 0 };
      let spend = 0;
      allOrders.forEach((o) => {
        if (statusMap[o.status] !== undefined) statusMap[o.status]++;
        spend += parseFloat(o.totalAmount) || 0;
      });

      setStats({
        totalOrders: allOrders.length,
        totalSpend: spend,
        statusCounts: statusMap,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reporting analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExportJson = () => {
    try {
      const exportData = {
        generatedAt: new Date().toISOString(),
        summary: stats,
        suppliers: suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          company: s.companyName,
          category: s.category,
          rating: s.rating,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.totalAmount,
          orderDate: o.orderDate || o.createdAt,
          supplier: o.supplier?.name || o.supplierName,
        })),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ProcureFlow_Report_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Report exported as JSON successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export report.', 'error');
    }
  };

  if (loading) {
    return <LoadingState message="Aggregating financial and procurement reports..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchReportData} />;
  }

  // Charts data
  const doughnutData = {
    labels: ['Pending Review', 'Approved', 'Delivered', 'Rejected'],
    datasets: [
      {
        data: [
          stats?.statusCounts?.PENDING || 0,
          stats?.statusCounts?.APPROVED || 0,
          stats?.statusCounts?.DELIVERED || 0,
          stats?.statusCounts?.REJECTED || 0,
        ],
        backgroundColor: ['#B9852C', '#2563A6', '#3F7D5A', '#B84C4C'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const barData = {
    labels: ['Q1 Target', 'Q2 Target', 'Q3 Actual', 'Q4 Projected'],
    datasets: [
      {
        label: 'Budget Utilization ($)',
        data: [45000, 62000, stats?.totalSpend || 58000, 75000],
        backgroundColor: '#2563A6',
        borderRadius: 6,
      },
    ],
  };

  // Compute spend per supplier
  const supplierSpendMap = {};
  orders.forEach((o) => {
    const sName = o.supplier?.name || o.supplierName || 'Unknown Vendor';
    if (!supplierSpendMap[sName]) {
      supplierSpendMap[sName] = { count: 0, total: 0 };
    }
    supplierSpendMap[sName].count += 1;
    supplierSpendMap[sName].total += parseFloat(o.totalAmount) || 0;
  });

  const supplierPerformance = Object.entries(supplierSpendMap).map(([name, val]) => ({
    name,
    count: val.count,
    total: val.total,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#263238]">Procurement Reports & Analytics</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Comprehensive audit reports, vendor spend distribution, and order volume metrics
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#172B4D] hover:bg-[#1E3863] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Report Data (JSON)</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E5E9] shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#EAF2FA] text-[#2563A6] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Total Transactions
            </p>
            <p className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">{stats?.totalOrders}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E5E9] shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#EDF5F0] text-[#3F7D5A] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Gross Value
            </p>
            <p className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">
              {formatCurrency(stats?.totalSpend)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E5E9] shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] text-[#172B4D] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
              Vendor Network
            </p>
            <p className="text-2xl font-bold tracking-tight text-[#263238] mt-0.5">{suppliers.length}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E2E5E9] shadow-xs">
          <h3 className="text-sm font-bold text-[#263238] mb-0.5">Status Volume Distribution</h3>
          <p className="text-xs text-[#667085] mb-4">Ratio of completed vs ongoing purchase orders</p>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: '#263238' } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E5E9] shadow-xs">
          <h3 className="text-sm font-bold text-[#263238] mb-0.5">Quarterly Spend Analysis</h3>
          <p className="text-xs text-[#667085] mb-4">Target allocations vs current procurement actuals</p>
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      font: { size: 10 },
                      color: '#667085',
                      callback: (value) => `$${value / 1000}k`,
                    },
                    grid: { color: '#E2E5E9' },
                  },
                  x: {
                    ticks: { font: { size: 11 }, color: '#667085' },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Supplier Spend Summary Table */}
      <div className="bg-white rounded-xl border border-[#E2E5E9] shadow-xs overflow-hidden p-5">
        <h3 className="text-sm font-bold text-[#263238] mb-0.5">Supplier Volume & Expenditure Breakdown</h3>
        <p className="text-xs text-[#667085] mb-4">
          Total value and orders fulfilled per vendor organization
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] text-[#667085] font-semibold border-b border-[#E2E5E9] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Supplier / Vendor</th>
                <th className="px-4 py-3 text-right">Orders Handled</th>
                <th className="px-4 py-3 text-right">Gross Total ($)</th>
                <th className="px-4 py-3 text-right">% of Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] text-[#263238]">
              {supplierPerformance.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-[#667085]">
                    No supplier volume records available.
                  </td>
                </tr>
              ) : (
                supplierPerformance.map((item, idx) => {
                  const pct = stats?.totalSpend ? ((item.total / stats.totalSpend) * 100).toFixed(1) : 0;
                  return (
                    <tr key={idx} className="hover:bg-[#F7F5F0]/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#263238]">{item.name}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#667085]">{item.count} orders</td>
                      <td className="px-4 py-3 text-right font-bold text-[#263238]">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#2563A6]">{pct}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

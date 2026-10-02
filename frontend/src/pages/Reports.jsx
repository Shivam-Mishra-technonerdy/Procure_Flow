import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/client';
import StatCard from '../components/StatCard';
import {
  BarChart3,
  DollarSign,
  FileSpreadsheet,
  Truck,
  Download,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ProcureFlow_Analytics_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Supplier breakdown chart data
  const supplierNames = stats?.supplierPerformance?.map((s) => s.supplier) || [];
  const supplierTotals = stats?.supplierPerformance?.map((s) => s.totalAmount) || [];

  const supplierChartData = {
    labels: supplierNames.length ? supplierNames : ['No Data'],
    datasets: [
      {
        label: 'Procurement Volume ($)',
        data: supplierTotals.length ? supplierTotals : [0],
        backgroundColor: '#0284c7',
        borderRadius: 8,
      },
    ],
  };

  const statusDoughnutData = {
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
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated expenditure insights, vendor performance metrics, and workflow distribution
          </p>
        </div>
        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics (JSON)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Expenditure"
          value={`$${Number(stats?.totalExpenditure || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          change="Approved & Delivered"
          color="purple"
        />
        <StatCard
          title="Completed Deliveries"
          value={stats?.deliveredOrders || 0}
          icon={Truck}
          change="100% fulfillment rate"
          color="emerald"
        />
        <StatCard
          title="Total Requisitions"
          value={stats?.totalOrders || 0}
          icon={FileSpreadsheet}
          change="Across all departments"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spend by Supplier Partner</h3>
              <p className="text-xs text-slate-400">Total dollar value assigned per vendor</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">USD</span>
          </div>
          <div className="h-64">
            <Bar
              data={supplierChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { callback: (v) => `$${v}` }, grid: { color: '#f8fafc' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full mb-4">
            <h3 className="text-sm font-bold text-slate-900">Status Allocation</h3>
            <p className="text-xs text-slate-400">Order lifecycle proportion</p>
          </div>
          <div className="w-52 h-52">
            <Doughnut
              data={statusDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Vendor Performance Breakdown</h3>
          <p className="text-xs text-slate-400">Order counts and financial commitment per supplier</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Supplier Partner</th>
                <th className="p-3.5 text-center">Fulfilled Orders</th>
                <th className="p-3.5 text-right">Cumulative Value</th>
                <th className="p-3.5 text-right">Avg Order Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.supplierPerformance?.map((sp, i) => {
                const count = sp.orderCount || 1;
                const total = parseFloat(sp.totalAmount) || 0;
                const avg = total / count;
                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-semibold text-slate-900">{sp.supplier}</td>
                    <td className="p-3.5 text-center">{count} orders</td>
                    <td className="p-3.5 text-right font-bold text-slate-900">${total.toFixed(2)}</td>
                    <td className="p-3.5 text-right text-slate-500">${avg.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
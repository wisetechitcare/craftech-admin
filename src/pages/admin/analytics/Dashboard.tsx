import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi } from '../../../services/api';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLoading from '../../../components/common/AdminLoading';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [sources, setSources] = useState<any>(null);
  const [conversionRates, setConversionRates] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<any>(null);
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const end = new Date();
      let start = new Date();

      if (dateRange === 'week') {
        start.setDate(start.getDate() - 7);
      } else if (dateRange === 'month') {
        start.setMonth(start.getMonth() - 1);
      }

      const params = { startDate: start.toISOString(), endDate: end.toISOString() };

      const [summaryRes, funnelRes, sourcesRes, ratesRes, responseRes] =
        await Promise.all([
          analyticsApi.summary(),
          analyticsApi.funnel(params),
          analyticsApi.sources(params),
          analyticsApi.conversionBySource(params),
          analyticsApi.responseTime(params),
        ]);

      setSummary(summaryRes.data.data);
      setFunnel(funnelRes.data.data);
      setSources(sourcesRes.data.data);
      setConversionRates(ratesRes.data.data);
      setResponseTime(responseRes.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-semibold text-navy mb-2">Analytics</h1>
            <p className="text-mid">Real-time insights into your lead pipeline</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-2">
            {['week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-6 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                  dateRange === range
                    ? 'bg-navy text-white'
                    : 'bg-white text-mid border border-line'
                }`}
              >
                {range === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Total Leads */}
          <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mid uppercase tracking-widest font-bold">
                  Total Leads
                </p>
                <p className="text-4xl font-semibold text-navy mt-2">
                  {dateRange === 'week' ? summary?.week?.leads || 0 : summary?.month?.leads || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-navy/20" />
            </div>
            <p className="text-xs text-mid">
              {dateRange === 'week' ? '7 days' : '30 days'}
            </p>
          </div>

          {/* Booked */}
          <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mid uppercase tracking-widest font-bold">
                  Booked
                </p>
                <p className="text-4xl font-semibold text-ok mt-2">
                  {dateRange === 'week' ? summary?.week?.booked || 0 : summary?.month?.booked || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-ok/20" />
            </div>
            <p className="text-xs text-mid">Confirmed projects</p>
          </div>

          {/* Conversion Rate */}
          <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mid uppercase tracking-widest font-bold">
                  Conversion Rate
                </p>
                <p className="text-4xl font-semibold text-accent mt-2">
                  {dateRange === 'week'
                    ? summary?.week?.conversionRatePercent || '0%'
                    : summary?.month?.conversionRatePercent || '0%'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/20" />
            </div>
            <p className="text-xs text-mid">Lead to booking</p>
          </div>

          {/* Response Time */}
          <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mid uppercase tracking-widest font-bold">
                  Avg Response
                </p>
                <p className="text-4xl font-semibold text-info mt-2">
                  {responseTime?.averageHours || 0}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-info/20" />
            </div>
            <p className="text-xs text-mid">Time to contact</p>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        {funnel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-2xl shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-navy mb-6">Conversion Funnel</h2>
            <div className="space-y-4">
              {Object.entries(funnel.byStatus).map(([status, count]) => {
                const percentage = ((count as number) / funnel.total) * 100;
                const colors: Record<string, string> = {
                  new: 'bg-info',
                  contacted: 'bg-info',
                  quoted: 'bg-[#7c3aed]',
                  negotiating: 'bg-orange-500',
                  booked: 'bg-ok',
                  rejected: 'bg-danger',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="capitalize font-bold text-navy">{status}</span>
                      <span className="text-sm font-bold text-mid">
                        {count as number} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-raise rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status] || 'bg-ink-faint'} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Lead Sources & Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Sources */}
          {sources && (
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold text-navy mb-6">Lead Sources</h2>
              <div className="space-y-3">
                {Object.entries(sources)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([source, count]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center p-4 bg-light rounded-lg"
                    >
                      <span className="capitalize font-bold text-navy">{source}</span>
                      <span className="font-bold text-accent">{count as number}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Conversion Rates by Source */}
          {conversionRates && (
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold text-navy mb-6">Conversion Rate by Source</h2>
              <div className="space-y-3">
                {Object.entries(conversionRates)
                  .sort(
                    ([, a]: any, [, b]: any) =>
                      parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
                  )
                  .map(([source, data]: any) => (
                    <div
                      key={source}
                      className="flex justify-between items-center p-4 bg-light rounded-lg"
                    >
                      <div>
                        <p className="capitalize font-bold text-navy">{source}</p>
                        <p className="text-xs text-mid">
                          {data.booked} of {data.total} converted
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-ok">
                        {data.conversionRate}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Export Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            onClick={async () => {
              try {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                // The export route is auth-protected, so fetch it through the
                // token-bearing axios client and download the returned blob.
                const res = await analyticsApi.exportCsv({
                  startDate: start.toISOString(),
                  endDate: end.toISOString(),
                });
                const url = URL.createObjectURL(res.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leads-${end.toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                toast.error('Export failed');
              }
            }}
            className="px-8 py-3 bg-navy text-white rounded-lg font-bold uppercase text-sm hover:bg-accent transition-colors"
          >
            📥 Export as CSV
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, Sector, LabelList } from 'recharts';
import { FinancialEntry, EntryType } from '../types';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface VisualizationsProps {
  entries: FinancialEntry[];
  currency: string;
}

const renderActiveShape = (props: any, currency: string) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#334155" className="text-sm font-bold">
        {payload.name.length > 15 ? `${payload.name.substring(0, 15)}...` : payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-semibold">{formatCurrency(value, currency)}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-[10px]">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-200 shadow-xl rounded-xl">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }}
              ></div>
              <span className="text-slate-500 font-medium capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-700 ml-auto tabular-nums">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Visualizations: React.FC<VisualizationsProps> = ({ entries, currency }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const assets = entries.filter(e => e.type === EntryType.ASSET);
  const liabilities = entries.filter(e => e.type === EntryType.LIABILITY);

  const assetAllocation = assets.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.value;
    } else {
      acc.push({ name: curr.category, value: curr.value });
    }
    return acc;
  }, []);

  const totalAssetsValue = assets.reduce((sum, e) => sum + e.value, 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, e) => sum + e.value, 0);

  const comparisonData = [
    { name: 'Financial Overview', assets: totalAssetsValue, liabilities: totalLiabilitiesValue }
  ];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Asset Allocation Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[450px]">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
          Asset Allocation
        </h3>
        <p className="text-xs text-slate-400 mb-6">Distribution by category</p>
        <div className="h-[320px] w-full">
          {assetAllocation.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={(props) => renderActiveShape(props, currency)}
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.CHART_PALETTE[index % COLORS.CHART_PALETTE.length]} strokeWidth={2} stroke="#fff" />
                  ))}
                </Pie>
                <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Add assets to see allocation
            </div>
          )}
        </div>
      </div>

      {/* Assets vs Liabilities Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[450px]">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
          Net Worth Breakdown
        </h3>
        <p className="text-xs text-slate-400 mb-6">Assets vs Liabilities comparison</p>
        <div className="h-[320px] w-full">
          {totalAssetsValue > 0 || totalLiabilitiesValue > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={20} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => `$${value >= 1000 ? value / 1000 + 'k' : value}`} 
                />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="assets" 
                  name="Total Assets" 
                  fill={COLORS.ASSET} 
                  radius={[8, 8, 8, 8]} 
                  barSize={60}
                  animationDuration={1500}
                  onMouseEnter={() => setHoveredBar('assets')}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === 'assets' && (
                    <LabelList 
                      dataKey="assets" 
                      position="top" 
                      formatter={(val: number) => formatCurrency(val, currency)}
                      style={{ fill: COLORS.ASSET, fontSize: 12, fontWeight: 'bold' }} 
                    />
                  )}
                </Bar>
                <Bar 
                  dataKey="liabilities" 
                  name="Total Liabilities" 
                  fill={COLORS.LIABILITY} 
                  radius={[8, 8, 8, 8]} 
                  barSize={60}
                  animationDuration={1500}
                  onMouseEnter={() => setHoveredBar('liabilities')}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === 'liabilities' && (
                    <LabelList 
                      dataKey="liabilities" 
                      position="top" 
                      formatter={(val: number) => formatCurrency(val, currency)}
                      style={{ fill: COLORS.LIABILITY, fontSize: 12, fontWeight: 'bold' }}
                    />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Add data to see comparison
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizations;

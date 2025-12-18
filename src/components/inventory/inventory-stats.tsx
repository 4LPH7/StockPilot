"use client"

import { useMemo } from 'react';
import type { InventoryItem } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Badge } from '../ui/badge';

type InventoryStatsProps = {
  items: InventoryItem[];
};

const COLORS = ['#673AB7', '#D1C4E9', '#7C4DFF', '#512DA8', '#B39DDB'];

export default function InventoryStats({ items }: InventoryStatsProps) {
  const { totalValue, totalItems, categoryData, topCategories } = useMemo(() => {
    const stats = items.reduce(
      (acc, item) => {
        acc.totalValue += item.price * item.quantity;
        acc.totalItems += item.quantity;
        const categoryValue = (acc.categoryValues[item.category] || 0) + item.price * item.quantity;
        acc.categoryValues[item.category] = categoryValue;
        return acc;
      },
      { totalValue: 0, totalItems: 0, categoryValues: {} as Record<string, number> }
    );

    const categoryChartData = Object.entries(stats.categoryValues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const topCategories = categoryChartData.slice(0, 3);

    return {
      totalValue: stats.totalValue,
      totalItems: stats.totalItems,
      categoryData: categoryChartData,
      topCategories,
    };
  }, [items]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-bold text-foreground">{`${payload[0].name}`}</p>
          <p className="text-sm text-primary">{`${formatCurrency(payload[0].value)} (${payload[0].payload.percent}%)`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">Total value of all items in stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
            >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total number of individual items</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-2">
                {topCategories.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <Badge variant="secondary">{cat.name}</Badge>
                        <span className="font-semibold">{formatCurrency(cat.value)}</span>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Inventory Value by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={categoryData.map(d => ({ ...d, percent: ((d.value / totalValue) * 100).toFixed(0) }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={50}
                innerRadius={30}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
               <Legend
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: '12px', lineHeight: '24px' }}
                formatter={(value) => <span className="text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

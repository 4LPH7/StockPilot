"use client"

import { useMemo } from 'react';
import type { InventoryItem } from '@/types/inventory';
import type { Currency } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart as BarChartIcon, DollarSign, Package, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';

type InventoryStatsProps = {
  items: InventoryItem[];
  currency: Currency;
  conversionRate: number;
};

const COLORS = ['#673AB7', '#D1C4E9', '#7C4DFF', '#512DA8', '#B39DDB'];

export default function InventoryStats({ items, currency, conversionRate }: InventoryStatsProps) {
    const convertPrice = (price: number) => {
        if (currency === 'USD') {
            return price / conversionRate;
        }
        return price;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

  const { totalValue, totalItems, lowStockCount, categoryData, topItems } = useMemo(() => {
    const stats = items.reduce(
      (acc, item) => {
        const itemPrice = currency === 'USD' ? item.price / conversionRate : item.price;
        const itemValue = itemPrice * item.quantity;
        acc.totalValue += itemValue;
        acc.totalItems += item.quantity;
        
        const categoryValue = (acc.categoryValues[item.category] || 0) + itemValue;
        acc.categoryValues[item.category] = categoryValue;

        acc.allItems.push({ name: item.name, value: itemValue });

        return acc;
      },
      { totalValue: 0, totalItems: 0, categoryValues: {} as Record<string, number>, allItems: [] as {name: string, value: number}[] }
    );

    const categoryChartData = Object.entries(stats.categoryValues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    const topItemsData = stats.allItems.sort((a,b) => b.value - a.value).slice(0, 5);
    const lowStockAlerts = items.filter((item) => item.quantity <= (item.lowStockThreshold ?? 10)).length;

    return {
      totalValue: stats.totalValue,
      totalItems: stats.totalItems,
      lowStockCount: lowStockAlerts,
      categoryData: categoryChartData,
      topItems: topItemsData,
    };
  }, [items, currency, conversionRate]);

  
  const CustomTooltip = ({ active, payload, label, isPie }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          { isPie ? (
            <>
              <p className="font-bold text-foreground">{`${data.name}`}</p>
              <p className="text-sm text-primary">{`${formatCurrency(data.value)} (${((data.value / totalValue) * 100).toFixed(0)}%)`}</p>
            </>
          ) : (
            <>
              <p className="font-bold text-foreground">{label}</p>
              <p className="text-sm text-primary">{`Value: ${formatCurrency(payload[0].value)}`}</p>
            </>
          ) }
        </div>
      );
    }
    return null;
  };


  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">Total value of all items in stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total number of individual items</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${categoryData ? (lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground") : ""}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
            {lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {lowStockCount === 0 ? "All items stocked adequately" : `${lowStockCount} item${lowStockCount === 1 ? "" : "s"} at or below threshold`}
          </p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top 5 Items by Value</CardTitle>
          <BarChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={topItems} margin={{ top: 10, right: 0, left: -20, bottom: -10 }}>
              <XAxis dataKey="name" tick={false} axisLine={false} />
              <YAxis tickFormatter={(value) => formatCurrency(value as number).slice(0, -1) + 'K'} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {topItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Value by Category</CardTitle>
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={categoryData}
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
              <Tooltip content={<CustomTooltip isPie={true} />} />
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

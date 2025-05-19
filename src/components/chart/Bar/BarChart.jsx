import React, { useContext } from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { WindmillContext } from '@windmill/react-ui';

const BarChart = ({
    data = [],
    xAxisDataKey = "name",
    barDataKeys = ["value"],
    barColors = ['#0694a2', '#1c64f2', '#7e3af2'],
    yAxisLabel = "",
    height = 300
}) => {
    const { mode } = useContext(WindmillContext);
    const textColor = mode === 'dark' ? '#fff' : '#000';
    const gridColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBackground = mode === 'dark' ? '#374151' : '#fff';
    const tooltipBorder = mode === 'dark' ? '#4B5563' : '#E5E7EB';

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                }}
            >
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey={xAxisDataKey}
                    stroke={textColor}
                    tick={{ fill: textColor }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                />
                <YAxis
                    stroke={textColor}
                    tick={{ fill: textColor }}
                    label={{
                        value: yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: textColor }
                    }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: tooltipBackground,
                        borderColor: tooltipBorder,
                        color: textColor,
                    }}
                    labelStyle={{ color: textColor }}
                    cursor={{ fill: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value.toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                {barDataKeys.map((key, index) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={barColors[index % barColors.length]}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

export default BarChart; 
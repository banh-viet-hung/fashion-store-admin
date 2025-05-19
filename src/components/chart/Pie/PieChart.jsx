import "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = ({
  data = [],
  nameKey = "_id",
  dataKey = "count",
  colors = ["#10B981", "#3B82F6", "#F97316", "#0EA5E9", "#6366F1", "#EC4899", "#8B5CF6", "#FBBF24"]
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const PieOption = {
    data: {
      datasets: [
        {
          data: data.map((item) => item[dataKey]),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 5,
          label: "Distribution",
        },
      ],
      labels: data.map((item) => item[nameKey]),
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const value = context.parsed;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  return (
    <div>
      <Pie {...PieOption} className="chart" />
    </div>
  );
};

export default PieChart;

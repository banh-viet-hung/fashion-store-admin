import { useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

const LineChart = ({
  salesReport = [],
  xKey = "date",
  lineKeys = ["total", "order"],
  yAxisLabel = ""
}) => {
  // Create a Set to store unique dates
  const uniqueDates = new Set();

  // Use filter to iterate through the array and add unique dates to the Set
  const updatedSalesReport = salesReport?.filter((item) => {
    const isUnique = !uniqueDates.has(item[xKey]);
    uniqueDates.add(item[xKey]);
    return isUnique;
  });

  const [activeKey, setActiveKey] = useState(lineKeys[0]);

  const handleClick = (keyName) => {
    setActiveKey(keyName);
  };

  const getColor = (keyName) => {
    const colorMap = {
      revenue: "#10B981", // emerald
      total: "#10B981", // emerald
      orders: "#F97316", // orange
      order: "#F97316", // orange
      growth: "#6366F1", // indigo
    };

    return colorMap[keyName] || "#10B981";
  };

  const barOptions = {
    data: {
      labels: updatedSalesReport
        ?.sort((a, b) => new Date(a[xKey]) - new Date(b[xKey]))
        ?.map((item) => item[xKey]),
      datasets: [
        {
          label: activeKey.charAt(0).toUpperCase() + activeKey.slice(1),
          data: updatedSalesReport
            ?.sort((a, b) => new Date(a[xKey]) - new Date(b[xKey]))
            ?.map((item) => item[activeKey]),
          borderColor: getColor(activeKey),
          backgroundColor: getColor(activeKey),
          borderWidth: 3,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          title: {
            display: yAxisLabel ? true : false,
            text: yAxisLabel,
          }
        }
      }
    },
    legend: {
      display: false,
    },
  };

  const { t } = useTranslation();

  const getKeyDisplayName = (key) => {
    const nameMap = {
      revenue: "Revenue",
      total: "Sales",
      orders: "Orders",
      order: "Orders",
      growth: "Growth %"
    };

    return t(nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1));
  };

  return (
    <>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-4">
        <ul className="flex flex-wrap -mb-px">
          {lineKeys.map((keyName) => (
            <li key={keyName} className="mr-2">
              <button
                onClick={() => handleClick(keyName)}
                type="button"
                className={`inline-block p-2 rounded-t-lg border-b-2 border-transparent ${activeKey === keyName
                  ? `text-${getColor(keyName).replace('#', '')} border-${getColor(keyName).replace('#', '')} dark:text-${getColor(keyName).replace('#', '')} dark:border-${getColor(keyName).replace('#', '')}`
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }  focus:outline-none`}
                style={{
                  color: activeKey === keyName ? getColor(keyName) : undefined,
                  borderBottomColor: activeKey === keyName ? getColor(keyName) : undefined,
                }}
              >
                {getKeyDisplayName(keyName)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Line {...barOptions} />
    </>
  );
};

export default LineChart;

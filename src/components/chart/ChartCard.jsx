import React from "react";
import Skeleton from "react-loading-skeleton";

const ChartCard = ({ children, title, loading, mode, height = "auto", filterComponent }) => {
  return (
    <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800" style={{ height }}>
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-gray-800 dark:text-gray-300">
          {loading ? (
            <Skeleton
              count={1}
              height={20}
              className="dark:bg-gray-800 bg-gray-200"
              baseColor={`${mode === "dark" ? "#010101" : "#f9f9f9"}`}
              highlightColor={`${mode === "dark" ? "#1a1c23" : "#f8f8f8"} `}
            />
          ) : (
            title
          )}
        </p>
        {filterComponent && !loading && (
          <div className="ml-auto">
            {filterComponent}
          </div>
        )}
      </div>

      <div className={`chart-container ${loading ? 'opacity-50' : ''}`} style={{ minHeight: "250px" }}>
        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Skeleton
              className="dark:bg-gray-800 bg-gray-200"
              baseColor={`${mode === "dark" ? "#010101" : "#f9f9f9"}`}
              highlightColor={`${mode === "dark" ? "#1a1c23" : "#f8f8f8"} `}
              count={1}
              width="100%"
              height={250}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;

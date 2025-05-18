import React from "react";

/**
 * Displays standardized pagination information
 * 
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @param {number} totalItems - Total number of items
 * @param {string} itemLabel - Label for the items (e.g., "sản phẩm", "danh mục")
 * @returns {JSX.Element} - Pagination information component
 */
const PaginationInfo = ({ currentPage, itemsPerPage, totalItems, itemLabel }) => {
    // Calculate start and end items
    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Handle zero items case
    if (totalItems === 0) {
        return (
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Không có {itemLabel} nào
            </div>
        );
    }

    return (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300 mr-1">
                {startItem} - {endItem}
            </span>
            trên tổng số
            <span className="font-medium text-gray-600 dark:text-gray-300 mx-1">
                {totalItems}
            </span>
            {itemLabel}
        </div>
    );
};

export default PaginationInfo; 
import React from 'react';
import { FiLoader } from 'react-icons/fi';

const PaginationLoading = () => {
    return (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex items-center gap-3">
                <FiLoader className="w-5 h-5 text-emerald-600 dark:text-emerald-500 animate-spin" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Đang tải dữ liệu...</span>
            </div>
        </div>
    );
};

export default PaginationLoading; 
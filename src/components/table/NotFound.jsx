import React from "react";
import noResult from "@/assets/img/no-result.svg";
import { FiInbox, FiSearch, FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";

const NotFound = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 my-6 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="w-full max-w-sm mb-4 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <FiInbox className="w-full h-full text-gray-400" />
        </div>
        <img
          className="relative z-10 mx-auto"
          src={noResult}
          alt="no-result"
          style={{ maxHeight: "200px", width: "auto" }}
        />
      </div>

      <div className="mt-2 mb-6">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("Không tìm thấy dữ liệu")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {title}
        </p>
      </div>

      <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm mt-2">
        <FiAlertCircle className="mr-2" />
        <span>{t("Thử thay đổi bộ lọc hoặc tạo mới")}</span>
      </div>
    </div>
  );
};

export default NotFound;

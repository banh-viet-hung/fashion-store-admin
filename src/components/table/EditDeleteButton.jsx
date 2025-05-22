import React from "react";
import { useTranslation } from "react-i18next";
import { FiEdit, FiTrash2, FiRotateCcw } from "react-icons/fi";
import Tooltip from "@/components/tooltip/Tooltip";

const EditDeleteButton = ({
  id,
  title,
  isDeleted,
  handleUpdate,
  handleModalOpen,
  handleRestoreModalOpen,
  isCheck,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end text-right">
      <button
        disabled={isCheck?.length > 0}
        onClick={() => handleUpdate(id)}
        className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none"
      >
        <Tooltip id="edit" Icon={FiEdit} title={t("Edit")} bgColor="#10B981" />
      </button>

      {isDeleted ? (
        <button
          disabled={isCheck?.length > 0}
          onClick={() => handleRestoreModalOpen(id, title)}
          className="p-2 cursor-pointer text-gray-400 hover:text-blue-600 focus:outline-none"
        >
          <Tooltip
            id="restore"
            Icon={FiRotateCcw}
            title={t("Khôi phục")}
            bgColor="#3B82F6"
          />
        </button>
      ) : (
        <button
          disabled={isCheck?.length > 0}
          onClick={() => handleModalOpen(id, title)}
          className="p-2 cursor-pointer text-gray-400 hover:text-red-600 focus:outline-none"
        >
          <Tooltip
            id="delete"
            Icon={FiTrash2}
            title={t("Delete")}
            bgColor="#EF4444"
          />
        </button>
      )}
    </div>
  );
};

export default EditDeleteButton;

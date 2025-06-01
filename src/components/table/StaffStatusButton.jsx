import React, { useContext, useState } from "react";
import { MdLock, MdLockOpen } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { t } from "i18next";
import { Button, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";

// internal import
import Tooltip from "@/components/tooltip/Tooltip";
import UserStatusServices from "@/services/UserStatusServices";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import LockAccountModal from "@/components/modal/LockAccountModal";

const StaffStatusButton = ({ email, isActive, handleUpdate }) => {
  const { setIsUpdate } = useContext(SidebarContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const openModal = () => {
    if (isActive) {
      // If we're locking an account, open the lock modal
      setIsLockModalOpen(true);
    } else {
      // If we're unlocking an account, open the regular confirmation modal
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChangeStatus = async (lockReason = null) => {
    try {
      setIsSubmitting(true);
      const res = await UserStatusServices.changeUserStatus(email, lockReason);
      setIsUpdate(true);
      notifySuccess(res.message || "Trạng thái tài khoản đã được thay đổi!");
      setIsSubmitting(false);
      closeModal();
      setIsLockModalOpen(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsSubmitting(false);
      closeModal();
      setIsLockModalOpen(false);
    }
  };

  const handleLockSubmit = (email, lockReason) => {
    handleChangeStatus(lockReason);
  };

  return (
    <div className="flex">
      <button
        onClick={handleUpdate}
        className="p-2 cursor-pointer text-gray-400 hover:text-emerald-600 focus:outline-none"
      >
        <Tooltip
          id="edit"
          Icon={FiEdit}
          title={t("Thay đổi quyền")}
          bgColor="#10B981"
        />
      </button>

      <button
        onClick={openModal}
        className="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {isActive ? (
          <Tooltip
            id="block"
            Icon={MdLock}
            title="Khóa tài khoản"
            bgColor="#f97316"
          />
        ) : (
          <Tooltip
            id="unlock"
            Icon={MdLockOpen}
            title="Mở khóa tài khoản"
            bgColor="#10B981"
          />
        )}
      </button>

      {/* Modal for unlocking accounts */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-500">
            <MdLockOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-medium mb-2">
            {t("Bạn muốn mở khóa tài khoản")}{" "}
            <span className="text-blue-500">{email}</span>?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tài khoản sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
          </p>
        </ModalBody>

        <ModalFooter className="justify-end gap-2 px-6 py-3 border-t border-gray-100 dark:border-gray-700">
          <Button
            className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            layout="outline"
            onClick={closeModal}
          >
            Hủy thao tác
          </Button>

          {isSubmitting ? (
            <Button
              disabled={true}
              type="button"
              className="h-10 flex items-center justify-center"
            >
              <img
                src={spinnerLoadingImage}
                alt="Loading"
                width={20}
                height={20}
                className="mr-2"
              />
              <span>Đang xử lý...</span>
            </Button>
          ) : (
            <Button
              onClick={() => handleChangeStatus()}
              className="h-10 bg-emerald-500 hover:bg-emerald-600"
            >
              {t("Xác nhận mở khóa")}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Modal for locking accounts with reason */}
      <LockAccountModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        onSubmit={handleLockSubmit}
        email={email}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StaffStatusButton; 
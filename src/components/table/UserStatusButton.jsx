import React, { useContext, useState } from "react";
import { MdLock, MdLockOpen } from "react-icons/md";
import { t } from "i18next";
import { Button, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";

// internal import
import Tooltip from "@/components/tooltip/Tooltip";
import UserStatusServices from "@/services/UserStatusServices";
import { SidebarContext } from "@/context/SidebarContext";
import { notifyError, notifySuccess } from "@/utils/toast";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const UserStatusButton = ({ email, isActive }) => {
  const { setIsUpdate } = useContext(SidebarContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChangeStatus = async () => {
    try {
      setIsSubmitting(true);
      const res = await UserStatusServices.changeUserStatus(email);
      setIsUpdate(true);
      notifySuccess(res.message || "Trạng thái tài khoản đã được thay đổi!");
      setIsSubmitting(false);
      closeModal();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setIsSubmitting(false);
      closeModal();
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="p-2 cursor-pointer text-gray-400 hover:text-yellow-600 focus:outline-none"
      >
        {isActive ? (
          <Tooltip
            id="block"
            Icon={MdLock}
            title={t("Block")}
            bgColor="#EF4444"
          />
        ) : (
          <Tooltip
            id="unlock"
            Icon={MdLockOpen}
            title={t("Unlock")}
            bgColor="#10B981"
          />
        )}
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
          <h2 className="text-xl font-medium mb-2">
            {isActive
              ? t("Bạn muốn khóa tài khoản") 
              : t("Bạn muốn mở khóa tài khoản")}{" "}
            <span className="text-blue-500">{email}</span>?
          </h2>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
            layout="outline"
            onClick={closeModal}
          >
            {t("Hủy thao tác")}
          </Button>
          <div className="flex justify-end">
            {isSubmitting ? (
              <Button
                disabled={true}
                type="button"
                className="w-full h-12 sm:w-auto"
              >
                <img
                  src={spinnerLoadingImage}
                  alt="Loading"
                  width={20}
                  height={10}
                />{" "}
                <span className="font-serif ml-2 font-light">
                  {t("Processing")}
                </span>
              </Button>
            ) : (
              <Button 
                onClick={handleChangeStatus} 
                className={`w-full h-12 sm:w-auto ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isActive ? t("Xác nhận khóa") : t("Xác nhận mở khóa")}
              </Button>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserStatusButton; 
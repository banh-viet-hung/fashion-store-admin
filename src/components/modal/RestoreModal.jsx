import { Button, Modal, ModalBody, ModalFooter } from "@windmill/react-ui";
import React, { useContext } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

//internal import
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import { notifyError, notifySuccess } from "@/utils/toast";

const RestoreModal = ({ id, productName }) => {
    const { isModalOpen, closeModal, setIsUpdate } = useContext(SidebarContext);
    const { setServiceId } = useToggleDrawer();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    const handleRestore = async () => {
        try {
            setIsSubmitting(true);
            const res = await ProductServices.restoreProduct(id);
            setIsUpdate(true);
            notifySuccess(res.message || "Khôi phục sản phẩm thành công!");
            setServiceId();
            closeModal();
        } catch (err) {
            notifyError(err?.response?.data?.message || err?.message || "Không thể khôi phục sản phẩm!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
                    <span className="flex justify-center text-3xl mb-6 text-blue-500">
                        <FiRotateCcw />
                    </span>
                    <h2 className="text-xl font-medium mb-2">
                        {t("Bạn muốn khôi phục")} <span className="text-blue-500">{productName}</span>?
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
                                />
                                <span className="font-serif ml-2 font-light">
                                    {t("Đang xử lý")}
                                </span>
                            </Button>
                        ) : (
                            <Button onClick={handleRestore} className="w-full h-12 sm:w-auto bg-blue-500 hover:bg-blue-600">
                                {t("Xác nhận khôi phục")}
                            </Button>
                        )}
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default RestoreModal; 
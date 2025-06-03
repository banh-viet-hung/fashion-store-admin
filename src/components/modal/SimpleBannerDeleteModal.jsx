import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from '@windmill/react-ui';
import { FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const SimpleBannerDeleteModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBody className="text-center px-8 pt-6 pb-4">
                <span className="flex justify-center text-3xl mb-6 text-red-500">
                    <FiTrash2 />
                </span>
                <h2 className="text-xl font-medium mb-1">
                    Bạn có chắc chắn muốn xóa?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác!
                </p>
            </ModalBody>
            <ModalFooter className="justify-center">
                <Button
                    className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
                    layout="outline"
                    onClick={onClose}
                >
                    Hủy
                </Button>
                <Button
                    onClick={onConfirm}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                    disabled={isLoading}
                >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default SimpleBannerDeleteModal; 
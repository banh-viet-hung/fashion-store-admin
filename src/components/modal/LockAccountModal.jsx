import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, Textarea, Button } from '@windmill/react-ui';
import { useTranslation } from 'react-i18next';
import { MdLock } from 'react-icons/md';
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const LockAccountModal = ({ isOpen, onClose, onSubmit, email, isSubmitting }) => {
    const { t } = useTranslation();
    const [lockReason, setLockReason] = useState('');

    const handleSubmit = () => {
        onSubmit(email, lockReason);
        setLockReason(''); // Reset reason after submit
    };

    const handleClose = () => {
        setLockReason(''); // Reset reason on close
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalHeader className="flex items-center">
                {t("Xác nhận khóa tài khoản")}
            </ModalHeader>
            <ModalBody className="px-5 py-3">
                <div className="text-center mb-5">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-500">
                        <MdLock className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">
                        {t("Bạn muốn khóa tài khoản")}{" "}
                        <span className="text-blue-500">{email}</span>?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tài khoản sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa.
                    </p>
                </div>

                <Label className="mt-4">
                    <span>{t("Lí do khóa tài khoản (Tùy chọn)")}</span>
                    <Textarea
                        className="mt-1"
                        rows="3"
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                        placeholder={t("Nhập lí do khóa tài khoản...")}
                    />
                </Label>
            </ModalBody>
            <ModalFooter className="justify-end gap-2 px-6 py-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                    className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    layout="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    Hủy thao tác
                </Button>

                {isSubmitting ? (
                    <Button
                        disabled={true}
                        type="button"
                        className="h-10 flex items-center justify-center bg-red-500"
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
                        onClick={handleSubmit}
                        className="h-10 bg-red-500 hover:bg-red-600"
                    >
                        {t("Xác nhận khóa")}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default LockAccountModal; 
import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, Textarea, Button } from '@windmill/react-ui';
import { useTranslation } from 'react-i18next';

const CancelOrderModal = ({ isOpen, onClose, onSubmit, orderId }) => {
    const { t } = useTranslation();
    const [cancelReason, setCancelReason] = useState('');

    const handleSubmit = () => {
        onSubmit(orderId, cancelReason);
        setCancelReason(''); // Reset reason after submit
        onClose();
    };

    const handleClose = () => {
        setCancelReason(''); // Reset reason on close
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalHeader>{t("Xác nhận hủy đơn hàng")} - #{orderId}</ModalHeader>
            <ModalBody>
                <Label className="mt-4">
                    <span>{t("Lí do hủy đơn hàng (Tùy chọn)")}</span>
                    <Textarea
                        className="mt-1"
                        rows="3"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder={t("Nhập lí do hủy đơn...")}
                    />
                </Label>
            </ModalBody>
            <ModalFooter>
                <div className="hidden sm:block">
                    <Button layout="outline" onClick={handleClose} className="mr-2">
                        {t("Hủy bỏ")}
                    </Button>
                </div>
                <div className="hidden sm:block">
                    <Button onClick={handleSubmit}>
                        {t("Cập nhật")}
                    </Button>
                </div>
                <div className="block w-full sm:hidden">
                    <Button block size="large" layout="outline" onClick={handleClose} className="mb-2">
                        {t("Hủy bỏ")}
                    </Button>
                </div>
                <div className="block w-full sm:hidden">
                    <Button block size="large" onClick={handleSubmit}>
                        {t("Cập nhật")}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default CancelOrderModal; 
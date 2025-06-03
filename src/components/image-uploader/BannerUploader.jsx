import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiXCircle } from "react-icons/fi";

// Internal imports
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError } from "@/utils/toast";

const BannerUploader = ({
    setImageUrl,
    imageUrl,
    setSelectedFile,
    maxWidth = 1920, // Chỉ giới hạn kích thước tối đa, không resize bắt buộc
    maxHeight = 1080,
}) => {
    const [previewFiles, setPreviewFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setError] = useState("");
    const { globalSetting } = useUtilsFunction();

    const { getRootProps, getInputProps, fileRejections } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        multiple: false,
        maxSize: 10485760, // 10 MB in bytes
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                try {
                    // Tạo preview và lưu file
                    const previewUrl = URL.createObjectURL(file);

                    // Kiểm tra kích thước ảnh
                    const img = new Image();
                    img.src = previewUrl;
                    await img.decode();

                    // Chỉ xử lý nếu ảnh quá lớn so với kích thước tối đa
                    if (img.width > maxWidth || img.height > maxHeight) {
                        const fileToUse = await processLargeImage(file, img, maxWidth, maxHeight);
                        setSelectedFile(fileToUse);

                        // Cập nhật preview
                        setPreviewFiles([
                            Object.assign(fileToUse, {
                                preview: URL.createObjectURL(fileToUse),
                            }),
                        ]);
                    } else {
                        // Sử dụng file gốc nếu kích thước phù hợp
                        setSelectedFile(file);

                        // Cập nhật preview với file gốc
                        setPreviewFiles([
                            Object.assign(file, {
                                preview: previewUrl,
                            }),
                        ]);
                    }
                } catch (error) {
                    console.error("Error processing image:", error);
                    notifyError("Không thể xử lý ảnh, vui lòng thử lại");
                }
            }
        },
    });

    // Xử lý ảnh quá lớn nhưng giữ nguyên tỷ lệ khung hình
    const processLargeImage = (file, img, maxWidth, maxHeight) => {
        return new Promise((resolve) => {
            // Tính toán tỷ lệ khung hình
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = Math.floor(img.width * ratio);
            const height = Math.floor(img.height * ratio);

            // Tạo canvas với kích thước đã tính
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            // Vẽ ảnh với chất lượng cao
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            // Chuyển đổi sang blob với chất lượng tối đa
            canvas.toBlob(
                (blob) => {
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    resolve(resizedFile);
                },
                file.type,
                1.0 // Chất lượng tối đa (100%)
            );
        });
    };

    useEffect(() => {
        if (fileRejections?.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                errors.forEach((e) => {
                    if (e.code === "too-many-files") {
                        notifyError("Chỉ được phép tải lên 1 ảnh cho mỗi banner");
                    } else if (e.code === "file-too-large") {
                        notifyError("Kích thước file quá lớn (tối đa 10MB)");
                    } else {
                        notifyError(e.message);
                    }
                });
            });
        }
    }, [fileRejections]);

    // Xóa preview khi component unmount
    useEffect(() => {
        return () => {
            previewFiles.forEach((file) =>
                file.preview && URL.revokeObjectURL(file.preview)
            );
        };
    }, [previewFiles]);

    const thumbs = previewFiles.map((file) => (
        <div key={file.name}>
            <div>
                <img
                    className="inline-flex border rounded-md border-gray-100 dark:border-gray-600 w-24 max-h-24 p-2"
                    src={file.preview}
                    alt={file.name}
                />
            </div>
        </div>
    ));

    const handleRemoveImage = () => {
        setImageUrl("");
        setPreviewFiles([]);
        setSelectedFile(null);
    };

    return (
        <div className="w-full text-center">
            <div
                className="border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer px-6 pt-5 pb-6"
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <span className="mx-auto flex justify-center">
                    <FiUploadCloud className="text-3xl text-emerald-500" />
                </span>
                <p className="text-sm mt-2">{t("DragYourImage")}</p>
                <em className="text-xs text-gray-400">{t("imageFormat")}</em>
            </div>

            <div className="text-emerald-500">{loading && err}</div>
            <aside className="flex flex-row flex-wrap mt-4">
                {imageUrl ? (
                    <div className="relative">
                        <img
                            className="inline-flex border rounded-md border-gray-100 dark:border-gray-600 w-24 max-h-24 p-2"
                            src={imageUrl}
                            alt="banner"
                        />
                        <button
                            type="button"
                            className="absolute top-0 right-0 text-red-500 focus:outline-none"
                            onClick={handleRemoveImage}
                        >
                            <FiXCircle />
                        </button>
                    </div>
                ) : (
                    thumbs
                )}
            </aside>
        </div>
    );
};

export default BannerUploader; 
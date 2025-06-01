import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import swal from "sweetalert";
import axios from "axios";
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { stateFromHTML } from 'draft-js-import-html';

//internal import
import useAsync from "./useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/CategoryServices";
import ProductServices from "@/services/ProductServices";
import ColorServices from "@/services/ColorServices";
import SizeServices from "@/services/SizeServices";
import ServerUploadService from "@/services/ServerUploadService";
import { notifyError, notifySuccess } from "@/utils/toast";

const useAddProductSubmit = () => {
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);

  // states
  const [imageUrls, setImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [productVariants, setProductVariants] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Load data
  const { data: categories } = useAsync(CategoryServices.getAllCategories);
  const { data: colors } = useAsync(ColorServices.getAllColors);
  const { data: sizes } = useAsync(SizeServices.getAllSizes);

  // Handle editor state change
  const onEditorStateChange = (state) => {
    setEditorState(state);
  };

  // Convert editor content to HTML
  const getHtmlContent = () => {
    return draftToHtml(convertToRaw(editorState.getCurrentContent()));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validate basic requirements
      if (imageUrls.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất 1 hình ảnh!");
      }

      if (selectedCategories.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất một danh mục!");
      }

      // Kiểm tra nếu giá khuyến mãi được nhập thì phải hợp lệ
      if (data.salePrice && Number(data.salePrice) > Number(data.price)) {
        setIsSubmitting(false);
        return notifyError("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc!");
      }

      // Validate các biến thể để đảm bảo không có số lượng âm
      if (!validateVariants()) {
        setIsSubmitting(false);
        return notifyError("Vui lòng nhập số lượng > 0 cho tất cả các biến thể sản phẩm!");
      }

      // 1. Tạo sản phẩm cơ bản trước
      const productData = {
        name: data.name,
        description: getHtmlContent(),
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : 0,
        categorySlugs: selectedCategories.map(cat => cat.slug),
        colorNames: selectedColors.map(color => color.name),
        sizeNames: selectedSizes.map(size => size.name)
      };

      const response = await ProductServices.addProduct(productData);

      if (!response.success) {
        setIsSubmitting(false);
        return notifyError(response.message || "Có lỗi xảy ra khi tạo sản phẩm!");
      }

      const productId = response.data;

      try {
        // 2. Upload và thêm hình ảnh cho sản phẩm
        const files = imageUrls.map(image => image.file);
        notifySuccess("Đang tải ảnh lên máy chủ...");
        const localServerUrls = await ServerUploadService.uploadMultipleImages(files);

        await ProductServices.addProductImages(productId, {
          imageUrls: localServerUrls
        });

        // 3. Thêm các biến thể sản phẩm
        await ProductServices.addProductVariants(productId, {
          variants: productVariants
        });

        // Hoàn thành quá trình
        notifySuccess("Tạo sản phẩm thành công!");
        setIsUpdate(true);
        reset();
        setImageUrls([]);
        setSelectedCategories([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setEditorState(EditorState.createEmpty());
        closeDrawer();
      } catch (error) {
        console.error("Lỗi trong quá trình xử lý:", error);
        notifyError("Tạo sản phẩm thành công nhưng có lỗi xảy ra khi xử lý hình ảnh hoặc biến thể!");
      }
    } catch (err) {
      console.error(err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image selection
  const handleImageUpload = (files) => {
    // In a real implementation, you might want to preview the images before upload
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // Limit to 6 images
    if (imageUrls.length + newFiles.length > 6) {
      return notifyError("Chỉ được tải lên tối đa 6 hình ảnh!");
    }

    // Store file objects for later upload
    setImageUrls(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    // Hủy URL.createObjectURL để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(imageUrls[index].preview);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
  };

  const handleColorChange = (selectedOptions) => {
    setSelectedColors(selectedOptions);
  };

  const handleSizeChange = (selectedOptions) => {
    setSelectedSizes(selectedOptions);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Generate variants based on selected colors and sizes
  const generateVariants = () => {
    // If no colors and sizes selected, create default variant
    if (selectedColors.length === 0 && selectedSizes.length === 0) {
      return [{
        colorName: null,
        sizeName: null,
        quantity: 0
      }];
    }

    // If only colors selected
    if (selectedColors.length > 0 && selectedSizes.length === 0) {
      return selectedColors.map(color => ({
        colorName: color.name,
        sizeName: null,
        quantity: 0
      }));
    }

    // If only sizes selected
    if (selectedColors.length === 0 && selectedSizes.length > 0) {
      return selectedSizes.map(size => ({
        colorName: null,
        sizeName: size.name,
        quantity: 0
      }));
    }

    // If both colors and sizes selected, create combinations
    const variants = [];

    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        // Check if this variant already exists in productVariants
        const existingVariant = productVariants.find(
          v => v.colorName === color.name && v.sizeName === size.name
        );

        variants.push({
          colorName: color.name,
          sizeName: size.name,
          quantity: existingVariant ? existingVariant.quantity : 0
        });
      }
    }

    return variants;
  };

  // Validate variants
  const validateVariants = () => {
    // Check for negative quantities
    const invalidVariants = productVariants.filter(variant => variant.quantity < 0);
    if (invalidVariants.length > 0) {
      return false;
    }

    // Kiểm tra xem tất cả các biến thể đã được nhập số lượng chưa (phải > 0)
    const zeroQuantityVariants = productVariants.filter(variant => variant.quantity === 0);
    if (zeroQuantityVariants.length > 0) {
      return false;
    }

    return true;
  };

  // Update variants when colors or sizes change
  useEffect(() => {
    setProductVariants(generateVariants());
  }, [selectedColors, selectedSizes]);

  // Update variant quantity
  const updateVariantQuantity = (index, quantity) => {
    const newVariants = [...productVariants];
    newVariants[index].quantity = Number(quantity);
    setProductVariants(newVariants);
  };

  // Handle continue to variants tab
  const handleContinueToVariants = () => {
    const data = {
      name: document.querySelector('input[name="name"]').value,
      price: document.querySelector('input[name="price"]').value,
      salePrice: document.querySelector('input[name="salePrice"]').value
    };

    // Validate basic form data
    if (!data.name) {
      return notifyError("Vui lòng nhập tên sản phẩm!");
    }

    if (!data.price) {
      return notifyError("Vui lòng nhập giá sản phẩm!");
    }

    if (selectedCategories.length === 0) {
      return notifyError("Vui lòng chọn ít nhất một danh mục!");
    }

    if (data.salePrice && Number(data.salePrice) > Number(data.price)) {
      return notifyError("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc!");
    }

    // Regenerate variants before switching tabs
    setProductVariants(generateVariants());

    // Switch to variants tab
    setActiveTab("variants");
  };

  // Dọn dẹp các URL khi component unmount
  useEffect(() => {
    return () => {
      // Cleanup object URLs khi unmount
      imageUrls.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    categories,
    colors,
    sizes,
    selectedCategories,
    selectedColors,
    selectedSizes,
    handleCategoryChange,
    handleColorChange,
    handleSizeChange,
    imageUrls,
    handleImageUpload,
    removeImage,
    activeTab,
    handleTabChange,
    productVariants,
    updateVariantQuantity,
    handleContinueToVariants,
    editorState,
    onEditorStateChange
  };
};

export default useAddProductSubmit; 
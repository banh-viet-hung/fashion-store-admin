import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { stateFromHTML } from 'draft-js-import-html';

// Internal imports
import useAsync from "./useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import CategoryServices from "@/services/CategoryServices";
import ProductServices from "@/services/ProductServices";
import ColorServices from "@/services/ColorServices";
import SizeServices from "@/services/SizeServices";
import UploadServices from "@/services/UploadServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useEditProductSubmit = (id) => {
  const { closeDrawer, setIsUpdate } = useContext(SidebarContext);

  // States
  const [imageUrls, setImageUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [productVariants, setProductVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const [productData, setProductData] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // React-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue
  } = useForm();

  // Load master data
  const { data: categories } = useAsync(CategoryServices.getAllCategories);
  const { data: colors } = useAsync(ColorServices.getAllColors);
  const { data: sizes } = useAsync(SizeServices.getAllSizes);

  // debug function
  const logDebugInfo = (message, data) => {
    console.log(`DEBUG ${message}:`, data);
    setDebugInfo(prev => ({
      ...prev,
      [message]: data
    }));
  };

  // Fetch product data when component mounts
  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Update master data selections when both product data and master data are available
  useEffect(() => {
    // Log master data for debugging
    setDebugInfo(prev => ({
      ...prev,
      categories: categories ? categories.length : 0,
      colors: colors ? colors.length : 0,
      sizes: sizes ? sizes.length : 0
    }));

    if (!productData) return;

    // Process categories when categories data is loaded
    if (categories && productData.categorySlugs) {
      logDebugInfo('categorySlugs', productData.categorySlugs);
      logDebugInfo('availableCategories', categories.map(c => c.slug));

      const selectedCats = categories.filter(cat =>
        productData.categorySlugs.includes(cat.slug)
      );
      logDebugInfo('selectedCategories', selectedCats);
      setSelectedCategories(selectedCats);
    }

    // Process colors when colors data is loaded
    if (colors && productData.colorNames) {
      logDebugInfo('colorNames', productData.colorNames);
      logDebugInfo('availableColors', colors.map(c => c.name));

      const selectedCols = colors.filter(color =>
        productData.colorNames.includes(color.name)
      );
      logDebugInfo('selectedColors', selectedCols);
      setSelectedColors(selectedCols);
    }

    // Process sizes when sizes data is loaded
    if (sizes && productData.sizeNames) {
      logDebugInfo('sizeNames', productData.sizeNames);
      logDebugInfo('availableSizes', sizes.map(s => s.name));

      const selectedSzs = sizes.filter(size =>
        productData.sizeNames.includes(size.name)
      );
      logDebugInfo('selectedSizes', selectedSzs);
      setSelectedSizes(selectedSzs);
    }

    // Process variants if available
    if (productData.variants && productData.variants.length > 0) {
      logDebugInfo('variantsFromProductData', productData.variants);
      setProductVariants(productData.variants);
    }
  }, [categories, colors, sizes, productData]);

  // Handle editor state change
  const onEditorStateChange = (state) => {
    setEditorState(state);
  };

  // Convert editor content to HTML
  const getHtmlContent = () => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    console.log("HTML content being sent:", html);
    return html;
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);

      // 1. Fetch product details
      const productResponse = await ProductServices.getProductById(id);
      logDebugInfo('productResponse', productResponse);

      if (productResponse.success) {
        const data = productResponse.data;
        logDebugInfo('productData', data);

        // Save product data for later processing when master data is loaded
        setProductData(data);

        // Set form values
        setValue("name", data.name);
        setValue("description", data.description || "");
        setValue("price", data.price);
        setValue("salePrice", data.salePrice || 0);

        // Initialize rich text editor with description HTML
        if (data.description) {
          try {
            const contentState = stateFromHTML(data.description);
            setEditorState(EditorState.createWithContent(contentState));
          } catch (error) {
            console.error("Error parsing HTML to editor state:", error);
            // Fallback to empty editor
            setEditorState(EditorState.createEmpty());
          }
        }

        // Get product images
        const imagesResponse = await ProductServices.getProductImages(id);
        logDebugInfo('imagesResponse', imagesResponse);

        if (imagesResponse.success && imagesResponse.data._embedded && imagesResponse.data._embedded.image) {
          const images = imagesResponse.data._embedded.image.map(img => ({
            id: img.id,
            url: img.url,
            isThumbnail: img.thumbnail
          }));

          logDebugInfo('processedImages', images);
          setExistingImages(images);
        }

        // Get product variants if not included in product response
        if (!data.variants || data.variants.length === 0) {
          const variantsResponse = await ProductServices.getProductVariants(id);
          logDebugInfo('variantsResponse', variantsResponse);

          if (variantsResponse.success && variantsResponse.data._embedded && variantsResponse.data._embedded.variants) {
            logDebugInfo('variantsFromAPI', variantsResponse.data._embedded.variants);
            setProductVariants(variantsResponse.data._embedded.variants);
          } else {
            // Default variant if no variants are found
            setProductVariants([{
              colorName: null,
              sizeName: null,
              quantity: 0
            }]);
          }
        }
      } else {
        notifyError(productResponse.message || "Không thể tải thông tin sản phẩm!");
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      notifyError("Đã xảy ra lỗi khi tải thông tin sản phẩm!");
    } finally {
      setLoading(false);
    }
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

  // Update variants when colors or sizes change
  useEffect(() => {
    if (!loading) {
      setProductVariants(generateVariants());
    }
  }, [selectedColors, selectedSizes, loading]);

  // Update variant quantity
  const updateVariantQuantity = (index, quantity) => {
    const newVariants = [...productVariants];
    newVariants[index].quantity = Number(quantity);
    setProductVariants(newVariants);
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

  // Handle form submission (update everything)
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validate
      if (!data.name) {
        setIsSubmitting(false);
        return notifyError("Tên sản phẩm là bắt buộc!");
      }

      if (selectedCategories.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất một danh mục!");
      }

      if (data.salePrice && Number(data.salePrice) > Number(data.price)) {
        setIsSubmitting(false);
        return notifyError("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc!");
      }

      // Validate variants if they exist
      if (productVariants.length > 0) {
        const invalidVariants = productVariants.filter(variant => variant.quantity < 0);
        if (invalidVariants.length > 0) {
          setIsSubmitting(false);
          return notifyError("Số lượng sản phẩm không được âm!");
        }
      }

      // Prepare data
      const productUpdateData = {
        name: data.name,
        description: getHtmlContent(),
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : 0,
        categorySlugs: selectedCategories.map(cat => cat.slug),
        colorNames: selectedColors.map(color => color.name),
        sizeNames: selectedSizes.map(size => size.name)
      };

      console.log("Sending product update with data:", productUpdateData);

      // Step 1: Update basic info
      const response = await ProductServices.updateProduct(id, productUpdateData);

      if (response.success) {
        // Step 2: Update images if changed
        if (existingImages.length > 0 || imageUrls.length > 0) {
          try {
            let allImageUrls = [...existingImages.map(img => img.url)];

            // Upload new images to Cloudinary if any
            if (imageUrls.length > 0) {
              const files = imageUrls.map(img => img.file);
              const cloudinaryUrls = await UploadServices.uploadMultipleImages(files);
              allImageUrls = [...allImageUrls, ...cloudinaryUrls];
            }

            // Update product images
            await ProductServices.updateProductImages(id, {
              imageUrls: allImageUrls
            });
          } catch (imageError) {
            console.error("Error updating images:", imageError);
            notifyError("Cập nhật thông tin cơ bản thành công, nhưng cập nhật hình ảnh thất bại!");
          }
        }

        // Step 3: Update variants
        try {
          const variantResponse = await ProductServices.updateProductVariants(id, {
            variants: productVariants
          });

          if (!variantResponse.success) {
            notifyError("Cập nhật thông tin sản phẩm thành công, nhưng cập nhật biến thể thất bại!");
          }
        } catch (variantErr) {
          console.error("Error updating variants:", variantErr);
          notifyError("Cập nhật thông tin cơ bản thành công, nhưng cập nhật biến thể thất bại!");
        }

        notifySuccess("Cập nhật sản phẩm thành công!");
        setIsUpdate(true);
        closeDrawer();
      } else {
        console.error("Error updating product:", response);
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật sản phẩm!");
      }
    } catch (err) {
      console.error("Error in product update:", err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi cập nhật sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update basic info only
  const handleUpdateBasicInfo = async () => {
    try {
      setIsSubmitting(true);

      const data = getValues();

      // Validate
      if (!data.name || !data.price) {
        setIsSubmitting(false);
        return notifyError("Vui lòng điền đầy đủ thông tin bắt buộc!");
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

      const productData = {
        name: data.name,
        description: getHtmlContent(),
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : 0,
        categorySlugs: selectedCategories.map(cat => cat.slug),
        colorNames: selectedColors.map(color => color.name),
        sizeNames: selectedSizes.map(size => size.name)
      };

      console.log("Sending product update with data:", productData);

      // Step 1: Update basic info
      const response = await ProductServices.updateProduct(id, productData);

      if (response.success) {
        // Step 2: Update variants
        try {
          const variantResponse = await ProductServices.updateProductVariants(id, {
            variants: productVariants
          });

          if (variantResponse.success) {
            notifySuccess("Cập nhật thông tin sản phẩm và biến thể thành công!");
          } else {
            notifyError("Cập nhật thông tin cơ bản thành công, nhưng cập nhật biến thể thất bại!");
          }
        } catch (variantErr) {
          console.error("Error updating variants:", variantErr);
          notifyError("Cập nhật thông tin cơ bản thành công, nhưng cập nhật biến thể thất bại!");
        }

        setIsUpdate(true);

        // Refresh product data to show updated info immediately
        fetchProductData();
      } else {
        console.error("Error updating basic info:", response);
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật thông tin cơ bản!");
      }
    } catch (err) {
      console.error("Error in handleUpdateBasicInfo:", err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi cập nhật thông tin cơ bản!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update images only
  const handleUpdateImages = async () => {
    try {
      setIsSubmitting(true);

      // Validate if there are images to update
      if (existingImages.length === 0 && imageUrls.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất 1 hình ảnh!");
      }

      let allImageUrls = [...existingImages.map(img => img.url)];

      // Upload new images to Cloudinary if any
      if (imageUrls.length > 0) {
        try {
          const files = imageUrls.map(img => img.file);
          const cloudinaryUrls = await UploadServices.uploadMultipleImages(files);
          allImageUrls = [...allImageUrls, ...cloudinaryUrls];
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          setIsSubmitting(false);
          return notifyError("Đã xảy ra lỗi khi tải lên hình ảnh mới: " + uploadError.message);
        }
      }

      // Update product images
      const response = await ProductServices.updateProductImages(id, {
        imageUrls: allImageUrls
      });

      if (response.success) {
        notifySuccess("Cập nhật hình ảnh thành công!");
        setIsUpdate(true);
        setImageUrls([]);  // Clear new images

        // Refresh product data to show updated images immediately
        const refreshResponse = await ProductServices.getProductImages(id);
        if (refreshResponse.success && refreshResponse.data._embedded && refreshResponse.data._embedded.image) {
          const images = refreshResponse.data._embedded.image.map(img => ({
            id: img.id,
            url: img.url,
            isThumbnail: img.thumbnail
          }));

          setExistingImages(images);
        }
      } else {
        console.error("Error updating product images:", response);
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật hình ảnh!");
      }
    } catch (err) {
      console.error("Error in handleUpdateImages:", err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi cập nhật hình ảnh!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update variants only
  const handleUpdateVariants = async () => {
    try {
      setIsSubmitting(true);

      // Validate variants
      if (!validateVariants()) {
        setIsSubmitting(false);
        return notifyError("Vui lòng nhập số lượng > 0 cho tất cả các biến thể sản phẩm!");
      }

      console.log("Updating variants with data:", { variants: productVariants });

      // Update variants
      const response = await ProductServices.updateProductVariants(id, {
        variants: productVariants
      });

      if (response.success) {
        notifySuccess("Cập nhật biến thể thành công!");
        setIsUpdate(true);

        // Refresh product data to reflect changes immediately
        if (productData && productData.variants) {
          // If product data already includes variants, update them
          setProductData({
            ...productData,
            variants: productVariants
          });
        } else {
          // Otherwise reload product data
          fetchProductData();
        }
      } else {
        console.error("Error updating variants:", response);
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật biến thể!");
      }
    } catch (err) {
      console.error("Error in handleUpdateVariants:", err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi cập nhật biến thể!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // Limit to 6 images total (existing + new)
    if (existingImages.length + imageUrls.length + newFiles.length > 6) {
      return notifyError("Chỉ được tải lên tối đa 6 hình ảnh!");
    }

    // Add new files
    setImageUrls(prev => [...prev, ...newFiles]);
  };

  // Remove new image
  const removeImage = (index) => {
    URL.revokeObjectURL(imageUrls[index].preview);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle category selection
  const handleCategoryChange = (selectedOptions) => {
    console.log("Selected categories:", selectedOptions);
    setSelectedCategories(selectedOptions);
  };

  // Handle color selection
  const handleColorChange = (selectedOptions) => {
    console.log("Selected colors:", selectedOptions);
    setSelectedColors(selectedOptions);
  };

  // Handle size selection
  const handleSizeChange = (selectedOptions) => {
    console.log("Selected sizes:", selectedOptions);
    setSelectedSizes(selectedOptions);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle continue to variants tab
  const handleContinueToVariants = () => {
    const data = getValues();

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

    // Switch to variants tab
    setActiveTab("variants");
  };

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
    existingImages,
    imageUrls,
    handleImageUpload,
    removeImage,
    removeExistingImage,
    activeTab,
    handleTabChange,
    productVariants,
    updateVariantQuantity,
    handleContinueToVariants,
    loading,
    handleUpdateBasicInfo,
    handleUpdateImages,
    handleUpdateVariants,
    debugInfo,
    refreshData: fetchProductData,
    editorState,
    onEditorStateChange
  };
};

export default useEditProductSubmit; 
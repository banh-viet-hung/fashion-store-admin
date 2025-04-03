import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  
  // Fetch product data when component mounts
  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);
  
  // Fetch product details
  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Get product details
      const productResponse = await ProductServices.getProductById(id);
      
      if (productResponse.success) {
        const product = productResponse.data;
        
        // Set form values
        setValue("name", product.name);
        setValue("description", product.description);
        setValue("price", product.price);
        setValue("salePrice", product.salePrice);
        
        // Set selected categories
        if (categories && product.categorySlugs) {
          const selectedCats = categories.filter(cat => 
            product.categorySlugs.includes(cat.slug)
          );
          setSelectedCategories(selectedCats);
        }
        
        // Set selected colors
        if (colors && product.colorNames) {
          const selectedCols = colors.filter(color => 
            product.colorNames.includes(color.name)
          );
          setSelectedColors(selectedCols);
        }
        
        // Set selected sizes
        if (sizes && product.sizeNames) {
          const selectedSiz = sizes.filter(size => 
            product.sizeNames.includes(size.name)
          );
          setSelectedSizes(selectedSiz);
        }
        
        // Set variants
        if (product.variants) {
          setProductVariants(product.variants);
        }
        
        // Get product images
        try {
          const imagesResponse = await fetch(`http://localhost:8080/product/${id}/images`);
          const imagesData = await imagesResponse.json();
          
          if (imagesData._embedded && imagesData._embedded.image) {
            const images = imagesData._embedded.image.map(img => ({
              id: img.id,
              url: img.url,
              isThumbnail: img.thumbnail
            }));
            
            setExistingImages(images);
          }
        } catch (error) {
          console.error("Error fetching product images:", error);
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
    
    // Check if total quantity is greater than 0
    const totalQuantity = productVariants.reduce((sum, variant) => sum + Number(variant.quantity || 0), 0);
    return totalQuantity > 0;
  };
  
  // Handle form submission (update everything)
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Validate basic requirements
      if (existingImages.length === 0 && imageUrls.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất 1 hình ảnh!");
      }
      
      if (selectedCategories.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất một danh mục!");
      }
      
      if (Number(data.salePrice) > Number(data.price)) {
        setIsSubmitting(false);
        return notifyError("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc!");
      }
      
      // Validate variants
      if (!validateVariants()) {
        setIsSubmitting(false);
        return notifyError("Vui lòng nhập số lượng hợp lệ cho các biến thể sản phẩm!");
      }
      
      // Prepare product data
      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        salePrice: Number(data.salePrice),
        categorySlugs: selectedCategories.map(cat => cat.slug),
        colorNames: selectedColors.map(color => color.name),
        sizeNames: selectedSizes.map(size => size.name)
      };
      
      // 1. Update basic product info
      const response = await ProductServices.updateProduct(id, productData);
      
      if (response.success) {
        try {
          // 2. Update images if new images were added
          if (imageUrls.length > 0) {
            // Upload new images to Cloudinary
            const files = imageUrls.map(img => img.file);
            const cloudinaryUrls = await UploadServices.uploadMultipleImages(files);
            
            // Combine existing and new images
            const allImageUrls = [
              ...existingImages.map(img => img.url),
              ...cloudinaryUrls
            ];
            
            // Update product images
            await ProductServices.updateProductImages(id, {
              imageUrls: allImageUrls
            });
          } else if (existingImages.length > 0) {
            // If no new images but existing images changed
            await ProductServices.updateProductImages(id, {
              imageUrls: existingImages.map(img => img.url)
            });
          }
          
          // 3. Update product variants
          await ProductServices.updateProductVariants(id, {
            variants: productVariants
          });
          
          // Success notification
          notifySuccess("Cập nhật sản phẩm thành công!");
          setIsUpdate(true);
          closeDrawer();
        } catch (error) {
          console.error("Lỗi khi xử lý ảnh hoặc variants:", error);
          notifyError("Cập nhật sản phẩm thành công nhưng có lỗi xảy ra khi xử lý hình ảnh hoặc biến thể!");
        }
      } else {
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật sản phẩm!");
      }
    } catch (err) {
      console.error(err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra!");
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
      if (!data.name) {
        setIsSubmitting(false);
        return notifyError("Tên sản phẩm là bắt buộc!");
      }
      
      if (selectedCategories.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất một danh mục!");
      }
      
      if (Number(data.salePrice) > Number(data.price)) {
        setIsSubmitting(false);
        return notifyError("Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc!");
      }
      
      // Prepare data
      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        salePrice: Number(data.salePrice),
        categorySlugs: selectedCategories.map(cat => cat.slug),
        colorNames: selectedColors.map(color => color.name),
        sizeNames: selectedSizes.map(size => size.name)
      };
      
      // Update basic info
      const response = await ProductServices.updateProduct(id, productData);
      
      if (response.success) {
        notifySuccess("Cập nhật thông tin cơ bản thành công!");
        setIsUpdate(true);
      } else {
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật thông tin sản phẩm!");
      }
    } catch (err) {
      console.error(err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update images only
  const handleUpdateImages = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate if new images are selected
      if (imageUrls.length === 0) {
        setIsSubmitting(false);
        return notifyError("Vui lòng chọn ít nhất 1 hình ảnh mới!");
      }
      
      // Upload new images to Cloudinary
      const files = imageUrls.map(img => img.file);
      const cloudinaryUrls = await UploadServices.uploadMultipleImages(files);
      
      // Replace product images with new ones
      const response = await ProductServices.updateProductImages(id, {
        imageUrls: cloudinaryUrls
      });
      
      if (response.success) {
        notifySuccess("Cập nhật hình ảnh thành công!");
        setIsUpdate(true);
        setImageUrls([]);  // Clear new images
        
        // Refresh images data
        try {
          const imagesResponse = await fetch(`http://localhost:8080/product/${id}/images`);
          const imagesData = await imagesResponse.json();
          
          if (imagesData._embedded && imagesData._embedded.image) {
            const images = imagesData._embedded.image.map(img => ({
              id: img.id,
              url: img.url,
              isThumbnail: img.thumbnail
            }));
            
            setExistingImages(images);
          }
        } catch (error) {
          console.error("Error refreshing product images:", error);
        }
      } else {
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật hình ảnh!");
      }
    } catch (err) {
      console.error(err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra!");
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
        return notifyError("Vui lòng nhập số lượng hợp lệ cho các biến thể sản phẩm!");
      }
      
      // Update variants
      const response = await ProductServices.updateProductVariants(id, {
        variants: productVariants
      });
      
      if (response.success) {
        notifySuccess("Cập nhật biến thể thành công!");
        setIsUpdate(true);
      } else {
        notifyError(response.message || "Có lỗi xảy ra khi cập nhật biến thể!");
      }
    } catch (err) {
      console.error(err);
      notifyError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (files) => {
    if (!files || files.length === 0) return;
    
    // Clear previous uploads first
    imageUrls.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImageUrls([]);
    
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    // Limit to 6 images
    if (newFiles.length > 6) {
      return notifyError("Chỉ được tải lên tối đa 6 hình ảnh!");
    }
    
    // Set new files (replacing any previous uploads)
    setImageUrls(newFiles);
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
    setSelectedCategories(selectedOptions);
  };
  
  // Handle color selection
  const handleColorChange = (selectedOptions) => {
    setSelectedColors(selectedOptions);
  };
  
  // Handle size selection
  const handleSizeChange = (selectedOptions) => {
    setSelectedSizes(selectedOptions);
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle continue to variants tab
  const handleContinueToVariants = () => {
    const basicData = getValues();
    
    // Validate basic form data
    if (!basicData.name) {
      return notifyError("Vui lòng nhập tên sản phẩm!");
    }
    
    if (!basicData.price) {
      return notifyError("Vui lòng nhập giá sản phẩm!");
    }
    
    if (selectedCategories.length === 0) {
      return notifyError("Vui lòng chọn ít nhất một danh mục!");
    }
    
    if (Number(basicData.salePrice) > Number(basicData.price)) {
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
    handleUpdateVariants
  };
};

export default useEditProductSubmit; 
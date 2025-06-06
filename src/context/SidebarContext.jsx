import LanguageServices from "@/services/LanguageServices";
import SettingServices from "@/services/SettingServices";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { createContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const resultsPerPage = 20;
  const searchRef = useRef("");
  const invoiceRef = useRef("");
  // const dispatch = useDispatch();

  const [limitData, setLimitData] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [lang, setLang] = useState("en");
  const [currLang, setCurrLang] = useState({
    iso_code: "en",
    name: "English",
    flag: "US",
  });
  const [time, setTime] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Add separate page states for each section
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);

  const [searchText, setSearchText] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [method, setMethod] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [windowDimension, setWindowDimension] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [navBar, setNavBar] = useState(true);
  const [drawerType, setDrawerType] = useState("add");
  const [productId, setProductId] = useState(null);
  const { i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  // Track the current active page type
  const [currentPageType, setCurrentPageType] = useState("product");

  const { data: globalSetting } = useQuery({
    queryKey: ["globalSetting"],
    queryFn: async () => await SettingServices.getGlobalSetting(),
    staleTime: 20 * 60 * 1000, //cache for 20 minutes,
    gcTime: 25 * 60 * 1000,
  });

  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => await LanguageServices.getShowingLanguage(),
    staleTime: 20 * 60 * 1000, //cache for 20 minutes,
    gcTime: 25 * 60 * 1000,
  });

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setProductId(null);
    setDrawerType("add");
  };
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeBulkDrawer = () => setIsBulkDrawerOpen(false);
  const toggleBulkDrawer = () => setIsBulkDrawerOpen(!isBulkDrawerOpen);

  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLanguageChange = (value) => {
    // console.log("handleChangeLang", value);

    Cookies.set("i18next", value?.iso_code, {
      sameSite: "None",
      secure: true, // Include the "secure" attribute
    });
    i18n.changeLanguage(value?.iso_code);
    setLang(value?.iso_code);
    Cookies.set("_currLang", JSON.stringify(value), {
      sameSite: "None",
      secure: true, // Include the "secure" attribute
    });
    setCurrLang(value);
  };

  // Updated version that uses the appropriate page state based on the page type
  const handleChangePage = (p, pageType = currentPageType) => {
    setPageLoading(true);

    // Update the appropriate page state based on page type
    switch (pageType) {
      case "product":
        setProductPage(p);
        break;
      case "category":
        setCategoryPage(p);
        break;
      case "coupon":
        setCouponPage(p);
        break;
      case "customer":
        setCustomerPage(p);
        break;
      case "order":
        setOrderPage(p);
        break;
      case "staff":
        setStaffPage(p);
        break;
      case "feedback":
        setFeedbackPage(p);
        break;
      default:
        setCurrentPage(p); // Fallback to the original state
    }

    // Also update the general currentPage for backward compatibility
    setCurrentPage(p);
  };

  // Helper function to get the current page for a specific page type
  const getPageByType = (pageType) => {
    switch (pageType) {
      case "product":
        return productPage;
      case "category":
        return categoryPage;
      case "coupon":
        return couponPage;
      case "customer":
        return customerPage;
      case "order":
        return orderPage;
      case "staff":
        return staffPage;
      case "feedback":
        return feedbackPage;
      default:
        return currentPage;
    }
  };

  const handleSubmitForAll = (e) => {
    e.preventDefault();
    if (!searchRef?.current?.value) return setSearchText(null);
    setSearchText(searchRef?.current?.value);
    setCategory(null);
  };

  // console.log("globalSetting", globalSetting, "languages", languages);

  useEffect(() => {
    const pathname = window?.location.pathname === "/login";

    // if (pathname) return;
    const defaultLang = globalSetting?.default_language || "en";
    const cookieLang = Cookies.get("i18next");
    const currLang = Cookies.get("_currLang");

    const removeRegion = (langCode) => langCode?.split("-")[0];

    let selectedLang = removeRegion(cookieLang || defaultLang);

    // Ensure language consistency with global settings
    if (globalSetting?.default_language) {
      selectedLang = removeRegion(globalSetting.default_language);
    }

    // Update state with selected language
    setLang(selectedLang);

    // Set i18next language & update cookies **only when needed**
    if (!cookieLang || cookieLang !== selectedLang) {
      Cookies.set("i18next", selectedLang, {
        sameSite: "None",
        secure: true,
      });
    }

    // Change i18n language **only if it differs**
    if (i18n.language !== selectedLang && !currLang) {
      i18n.changeLanguage(selectedLang);
    }

    // Find the corresponding language object
    if (languages?.length && !pathname && !currLang) {
      const result = languages?.find((lang) => lang?.iso_code === selectedLang);
      setCurrLang(result);
    }
  }, [globalSetting?.default_language, languages]); // Add `languages` as a dependency

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openEditDrawer = (id) => {
    setProductId(id);
    setDrawerType("edit");
    setIsDrawerOpen(true);
  };

  return (
    <SidebarContext.Provider
      value={{
        method,
        setMethod,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
        setIsDrawerOpen,
        closeBulkDrawer,
        isBulkDrawerOpen,
        toggleBulkDrawer,
        isModalOpen,
        toggleModal,
        closeModal,
        isUpdate,
        setIsUpdate,
        lang,
        setLang,
        currLang,
        handleLanguageChange,
        currentPage,
        setCurrentPage,
        handleChangePage,
        // Add new page-specific states and getters
        productPage,
        categoryPage,
        couponPage,
        customerPage,
        orderPage,
        staffPage,
        feedbackPage,
        getPageByType,
        currentPageType,
        setCurrentPageType,
        searchText,
        setSearchText,
        category,
        setCategory,
        searchRef,
        handleSubmitForAll,
        status,
        setStatus,
        zone,
        setZone,
        time,
        setTime,
        sortedField,
        setSortedField,
        resultsPerPage,
        limitData,
        setLimitData,
        windowDimension,
        modalOpen,
        setModalOpen,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        setLoading,
        pageLoading,
        setPageLoading,
        invoice,
        setInvoice,
        invoiceRef,
        setNavBar,
        navBar,
        tabIndex,
        setTabIndex,
        drawerType,
        setDrawerType,
        productId,
        setProductId,
        openEditDrawer,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

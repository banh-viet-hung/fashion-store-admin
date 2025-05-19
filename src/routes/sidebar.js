import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCompass,
  FiSettings,
  FiSlack,
  FiGlobe,
  FiTarget,
} from "react-icons/fi";

const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Phân tích", // name that appear in Sidebar
  },

  {
    icon: FiSlack,
    name: "Danh mục",
    routes: [
      {
        path: "/products",
        name: "Sản phẩm",
      },
      {
        path: "/categories",
        name: "Danh mục",
      },
      {
        path: "/coupons",
        name: "Mã giảm giá",
      },
    ],
  },

  {
    path: "/customers",
    icon: FiUsers,
    name: "Khách hàng",
  },
  {
    path: "/orders",
    icon: FiCompass,
    name: "Đơn hàng",
  },

  {
    path: "/our-staff",
    icon: FiUser,
    name: "Nhân viên",
  },

  // {
  //   path: "/settings?settingTab=common-settings",
  //   icon: FiSettings,
  //   name: "Cài đặt",
  // },
  // {
  //   icon: FiGlobe,
  //   name: "International",
  //   routes: [
  //     {
  //       path: "/languages",
  //       name: "Languages",
  //     },
  //     {
  //       path: "/currencies",
  //       name: "Currencies",
  //     },
  //   ],
  // },
  // {
  //   icon: FiTarget,
  //   name: "OnlineStore",
  //   routes: [
  //     {
  //       name: "ViewStore",
  //       path: "/store",
  //       outside: "store",
  //     },

  //     {
  //       path: "/store/customization",
  //       name: "StoreCustomization",
  //     },
  //     {
  //       path: "/store/store-settings",
  //       name: "StoreSettings",
  //     },
  //   ],
  // },

  // {
  //   icon: FiSlack,
  //   name: "Pages",
  //   routes: [
  //     // submenu

  //     {
  //       path: "/404",
  //       name: "404",
  //     },
  //     {
  //       path: "/coming-soon",
  //       name: "Coming Soon",
  //     },
  //   ],
  // },
];

export default sidebar;

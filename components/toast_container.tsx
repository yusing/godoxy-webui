import { useTheme } from "next-themes";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export const NextToastContainer = () => {
  const { theme } = useTheme();

  return (
    <ToastContainer
      closeOnClick
      newestOnTop
      autoClose={2000}
      position="bottom-left"
      theme={theme}
    />
  );
};

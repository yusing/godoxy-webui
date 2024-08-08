import { useTheme } from "next-themes";
import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';

export const NextToastContainer = () => {
    const { theme } = useTheme();

    return (<ToastContainer
        position="bottom-left"
        autoClose={3000}
        closeOnClick
        newestOnTop
        pauseOnHover={false}
        theme={theme}
    />);
}
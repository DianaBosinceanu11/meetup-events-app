import "../styles/global.css";
import Navbar from "../components/Navbar"; // Navbar added 

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

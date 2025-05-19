import Footer from "./components/Layout/Footer";
import MainLayout from "./components/Layout/MainLayout";
import NavBar from "./components/Layout/NavBar";
import "./styles/globals.css";

function App() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <NavBar />
      <MainLayout />
      <Footer />
    </div>
  );
}

export default App;

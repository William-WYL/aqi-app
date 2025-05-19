import ForeCastContainer from "../Forecast/ForecastContainer";
import InfoContainer from "../Info/InfoContainer";


const MainLayout = () => {
  return (
    <>
      <div className="shadow-md">
        <InfoContainer />
        <ForeCastContainer />
      </div>
    </>
  );
};

export default MainLayout;
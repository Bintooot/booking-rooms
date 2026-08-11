import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner.jsx";

function RoomCreation() {
  const { theme, toggleTheme } = useOutletContext();

  return (
    <>
      <main className="w-full">
        <Banner
          header="Room Creation"
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </main>
    </>
  );
}
export default RoomCreation;

import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner";

function UserCreation() {
  const { theme, toggleTheme } = useOutletContext();

  return (
    <>
      <main className="w-full">
        <Banner
          header="User Creation"
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </main>
    </>
  );
}
export default UserCreation;

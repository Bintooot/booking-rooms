import { Link, useNavigate } from "react-router-dom";
import maintenance from "../../assets/maintenance.svg";

function Unavailable() {
  const navigate = useNavigate();

  return (
    <>
      <main className="h-screen flex flex-col gap-5 items-center justify-center text-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <img
            width={320}
            className="mb-5"
            src={maintenance}
            alt="Page unavailable"
          />
          <h1 className="text-6xl text-blue-400 font-bold">Coming Soon</h1>
          <p className="text-slate-400 italic">
            This page is currently unavailable. Please check back later.
          </p>
        </div>
      </main>
    </>
  );
}
export default Unavailable;

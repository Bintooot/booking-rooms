import { useTheme } from "../../context/ThemeContext";

function Login() {
  const { theme } = useTheme();

  return (
    <>
      <main className="grid h-full grid-cols-4 grid-rows-2">
        <div
          className={`row-span-2 border-2 ${theme ? `border-white` : `border-black`}`}
        >
          1
        </div>
        <div className="col-span-3 flex items-center justify-center flex-col">
          <h1
            className={`font-bold text-6xl ${theme ? `text-white` : `border-black`}`}
          >
            Welcome Back!
          </h1>
          <p className={`italic ${theme ? `text-white` : `text-slate-900`}`}>
            Book a room now.
          </p>
        </div>
        <div
          className={`col-span-3 ${theme ? `border-white` : `border-black`} border-t-2 border-r-2 border-b-2 grid grid-cols-3`}
        >
          <div></div>
          <div className="grid grid-rows-3">
            <div></div>
            <div></div>
            <div
              className={`
                flex
                items-center
                justify-center
                italic
                border
                border-dashed
                transition-all
                duration-200
                hover:-translate-y-2
                hover:-translate-x-2
                hover:shadow-[6px_6px_0_0_#0f172a]
                ${theme ? `border-white text-white hover:shadow-white` : `border-black `}
              `}
            >
              Lobby
            </div>
          </div>
          <div></div>
        </div>
      </main>
    </>
  );
}
export default Login;

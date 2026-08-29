import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";

function Login() {
  const { theme } = useTheme();

  const vacancies = [
    { room: "Room 1", availability: true },
    { room: "Room 1", availability: false },
    { room: "Room 1", availability: true },
    { room: "Room 1", availability: true },
    { room: "Room 1", availability: false },
    { room: "Room 1", availability: true },
    { room: "Room 1", availability: true },
    { room: "Room 1", availability: true },
  ];

  return (
    <main className="h-full flex flex-col">
      <header
        className={`flex items-center justify-between px-5 py-3 mb-5 rounded-lg border ${
          theme
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-100 border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Hijo Resources Corporation logo"
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <p
              className={`font-semibold text-base ${theme ? "text-white" : "text-slate-900"}`}
            >
              Hijo Resources Corporation
            </p>
            <p
              className={`text-xs ${theme ? "text-slate-400" : "text-slate-500"}`}
            >
              Room booking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span
            className={`text-xs font-medium ${theme ? "text-slate-300" : "text-slate-600"}`}
          >
            {vacancies.length} rooms free now
          </span>
        </div>
      </header>

      <section className="w-full h-screen">
        <div className="w-[30%] overflow-y-scroll scrollbar-none">
          {vacancies.map((vacancy) => (
            <div
              key={vacancy.room}
              className={`w-full mb-5 h-30 border rounded flex items-center justify-center ${
                vacancy.availability
                  ? theme
                    ? "border-emerald-700 bg-emerald-900/20"
                    : "border-emerald-300 bg-emerald-50"
                  : theme
                    ? "border-red-900 bg-red-950/30"
                    : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`font-medium ${
                  vacancy.availability
                    ? theme
                      ? "text-emerald-300"
                      : "text-emerald-700"
                    : theme
                      ? "text-red-300"
                      : "text-red-700"
                }`}
              >
                {vacancy.room}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
export default Login;

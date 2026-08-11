import { Link } from "react-router-dom";
import { Moon } from "lucide-react";

function LandingPage() {
  return (
    <main className="bg-gray-900 min-h-screen">
      <section className="flex items-center justify-between p-5">
        <div className="group border rounded border-gray-400 p-1 shadow-2xl shadow-green-500/40 cursor-pointer hover:bg-white hover:scale-110 active:scale-95 transition-transform duration-150">
          <Moon size={20} className="text-white group-hover:text-gray-900" />
        </div>
      </section>
      <section>
        <div>
          <img src="" alt="" />
        </div>
      </section>
    </main>
  );
}

export default LandingPage;

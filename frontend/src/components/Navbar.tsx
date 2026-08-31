import { Link, useLocation } from "react-router-dom";
import { ScanEye } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-scan/40 bg-scan/10 text-scan">
            <ScanEye size={18} strokeWidth={2} />
          </span>
          Resume<span className="text-gradient">AI</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-text-dim">
          <Link
            to="/"
            className={`hidden transition-colors hover:text-text sm:block ${pathname === "/" ? "text-text" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/analyze"
            className="rounded-full border border-scan/40 bg-scan/10 px-4 py-2 font-medium text-scan transition-colors hover:bg-scan/20"
          >
            Analyze My Resume
          </Link>
        </div>
      </nav>
    </header>
  );
}

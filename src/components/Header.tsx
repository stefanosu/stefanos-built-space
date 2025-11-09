import { Link } from "react-router-dom";
import { NavLink } from "./NavLink";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight hover:text-accent transition-colors duration-300"
          >
            Stefanos Ugbit
          </Link>

          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground transition-all duration-300 nav-underline pb-1"
              activeClassName="text-foreground nav-underline-active"
            >
              Home
            </NavLink>
            <NavLink
              to="/writing"
              className="text-muted-foreground hover:text-foreground transition-all duration-300 nav-underline pb-1"
              activeClassName="text-foreground nav-underline-active"
            >
              Writing
            </NavLink>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-foreground transition-all duration-300 nav-underline pb-1"
            >
              Contact
            </a>
            <button
              onClick={() => {
                const el = document.documentElement;
                const next = el.classList.toggle("dark") ? "dark" : "light";
                localStorage.setItem("theme", next);
              }}
              className="p-2 rounded-md border border-border hover:bg-accent/10 transition"
              aria-label="Toggle theme"
            >
              🌓
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

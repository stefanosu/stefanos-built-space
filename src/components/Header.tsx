import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { NavLink } from "./NavLink";

const Header = () => {
  const getCurrentTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") {
      return "light";
    }
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getCurrentTheme);

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  const toggleTheme = () => {
    const el = document.documentElement;
    const next = theme === "dark" ? "light" : "dark";

    if (next === "dark") {
      el.classList.add("dark");
    } else {
      el.classList.remove("dark");
    }

    localStorage.setItem("theme", next);
    setTheme(next);
  };

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
              onClick={toggleTheme}
              className="p-2 rounded-md border border-border hover:bg-accent/10 transition flex items-center justify-center"
              aria-label="Toggle theme"
            >
              <span className="sr-only">Toggle theme</span>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

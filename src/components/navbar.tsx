import { Link } from "react-router-dom";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { Button } from "./ui/button";
import { Factory } from "lucide-react";
import { ColorThemeSwitcher } from "./theme/ColorThemeSwitcher";

function Navbar() {
  return (
    <div className="relative z-10">
      <nav className="max-w-screen-xl mx-auto py-4 rounded-xl px-4 md:px-6 shadow-sm flex items-center justify-between">
        <Link to="/" reloadDocument className="flex items-center gap-2 min-w-0">
          <Factory className="h-8 w-8 text-muted-foreground" />
          <p className="text-xl sm:text-2xl text-foreground font-bold truncate">TextilePro.</p>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ColorThemeSwitcher/>
          <ThemeSwitcher />
          <Link to="/auth/login">
            <Button variant="ghost" size="sm" className="text-foreground px-3 sm:px-4 whitespace-nowrap">
              Sign in
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm" className="bg-foreground text-background px-3 sm:px-4 whitespace-nowrap hover:bg-foreground/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;



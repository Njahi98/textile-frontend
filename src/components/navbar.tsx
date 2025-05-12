import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

function Navbar() {
  return (
    <div className="max-w-screen-xl mx-auto py-4 border rounded-xl px-4 md:px-6 shadow-sm flex justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="/logo.webp"
          alt="site logo"
          className="h-10 object-cover  dark:grayscale"
        />
        <p className="text-2xl font-bold">Textile.</p>
      </Link>

      <ModeToggle />
      <div className="items-center gap-5 hidden md:flex">
        <Link to="/auth/login">
          <p className="hover:cursor-pointer">Log in</p>
        </Link>
        <Link to="/auth/register">
          <Button className="hover:cursor-pointer">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;

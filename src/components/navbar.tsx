import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Backdrop from "./ui/backdrop";
import { AnimatePresence, motion } from "framer-motion";

function Navbar() {
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isBackDropOpen ? "hidden" : "auto";
  }, [isBackDropOpen]);

  return (
    <>
      <nav className="max-w-screen-xl mx-auto py-4 border rounded-xl px-4 md:px-6 shadow-sm flex justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.webp"
            alt="site logo"
            className="h-10 object-cover dark:grayscale"
          />
          <p className="text-2xl font-bold">Textile.</p>
        </Link>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden hover:cursor-pointer"
          onClick={() => setIsBackDropOpen(!isBackDropOpen)}
        >
          {isBackDropOpen ? <X /> : <Menu />}
        </Button>

        <div className="items-center gap-4 hidden md:flex">
          <ModeToggle />
          <Link to="/auth/login">
            <p className="hover:cursor-pointer">Log in</p>
          </Link>
          <Link to="/auth/register">
            <Button className="hover:cursor-pointer">Get Started</Button>
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {isBackDropOpen && (
          <Backdrop onClick={() => setIsBackDropOpen(false)}>
            <motion.div
              className="fixed w-full bg-background border-t"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto px-4 py-6 flex flex-col gap-4">
                <ModeToggle />
                <div className="flex gap-4 justify-center">
                  <Link
                    className="w-full"
                    to="/auth/login"
                    onClick={() => setIsBackDropOpen(false)}
                  >
                    <Button variant="outline" className="w-full border-t">
                      Log in
                    </Button>
                  </Link>
                  <Link
                    className="w-full"
                    to="/auth/register"
                    onClick={() => setIsBackDropOpen(false)}
                  >
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;

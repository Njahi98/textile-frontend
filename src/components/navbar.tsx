import { Link } from "react-router-dom";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { Button } from "./ui/button";
import { useEffect, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import Backdrop from "./ui/backdrop";
import { AnimatePresence, motion } from "framer-motion";
import AccordionNavbar from "./ui/accordion-navbar";

function Navbar() {
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);

  const toggleBackdrop = useCallback(() => {
    setIsBackDropOpen((prev) => !prev);
  }, []);

  const closeBackdrop = () => {
    setIsBackDropOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isBackDropOpen ? "hidden" : "auto";
  }, [isBackDropOpen]);

  return (
    <>
      <nav className="max-w-screen-xl mx-auto py-4 border rounded-xl px-4 md:px-6 shadow-sm flex justify-between">
        <Link to="/" reloadDocument className="flex items-center gap-2">
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
          onClick={toggleBackdrop}
        >
          {isBackDropOpen ? <X /> : <Menu />}
        </Button>

        <div className="items-center gap-4 hidden md:flex">
          <ThemeSwitcher />
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
          <Backdrop onClick={closeBackdrop}>
            <motion.div
              className="fixed w-full bg-background border-t will-change-transform"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto px-4 py-6 flex flex-col gap-4">
                <ul className="flex flex-col gap-4 *:border-b *:pb-3 *:last:border-b-0 text-sm font-medium">


                  <AccordionNavbar 
                    name="Home" 
                    hasDetails={false} 
                    onClick={closeBackdrop} 
                    path="/"
                  />
                  

                  <AccordionNavbar 
                    name="Products" 
                    hasDetails={true} 
                    onClick={closeBackdrop} 
                    path="/products"
                    children={[
                      { name: "Overview", path: "/products" },
                      { name: "Fabrics", path: "/products/fabrics" },
                      { name: "Pricing", path: "/products/pricing" }
                    ]}
                  />
                  

                  <AccordionNavbar 
                    name="About Us" 
                    hasDetails={false} 
                    onClick={closeBackdrop} 
                    path="/about"
                  />
                  

                  <AccordionNavbar 
                    name="Resources" 
                    hasDetails={true} 
                    onClick={closeBackdrop} 
                    path="/resources"
                    children={[
                      { name: "Blog", path: "/blog" },
                      { name: "Documentation", path: "/docs" },
                      { name: "Support", path: "/support" }
                    ]}
                  />
                </ul>

                <div className="flex justify-end">
                  <ThemeSwitcher />
                </div>
                <div className="flex gap-4 justify-center">
                  <Link
                    className="w-full"
                    to="/auth/login"
                    onClick={closeBackdrop}
                  >
                    <Button variant="outline" className="w-full border-t">
                      Log in
                    </Button>
                  </Link>
                  <Link
                    className="w-full"
                    to="/auth/register"
                    onClick={closeBackdrop}
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

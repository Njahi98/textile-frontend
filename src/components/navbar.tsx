import { Link } from "react-router-dom";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { Button } from "./ui/button";
import { Factory, Menu, X } from "lucide-react";
import { ColorThemeSwitcher } from "./theme/ColorThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GithubRepoIcon from "./GithubRepoIcon";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {t}=useTranslation(['common'])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative z-50">
      <nav className="max-w-screen-xl mx-auto py-4 rounded-md px-6 md:px-6 shadow-sm flex items-center justify-between">
        <Link to="/" reloadDocument className="flex items-center gap-2 min-w-0">
          <Factory className="h-8 w-8 text-muted-foreground" />
          <p className="text-xl sm:text-2xl text-foreground font-bold truncate">TextilePro.</p>
        </Link>

        <div className="hidden lg:flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher/>
          <GithubRepoIcon />
          <ColorThemeSwitcher/>
          <ThemeSwitcher />
          <Link to="/auth/login">
            <Button variant="ghost" size="sm" className="text-foreground px-3 sm:px-6 whitespace-nowrap">
              {t('navbar.loginButton')}
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm" className="bg-foreground text-background px-3 sm:px-6 whitespace-nowrap hover:bg-foreground/90">
              {t('navbar.signUpButton')}
            </Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </Button>
      </nav>

      {isMobileMenuOpen && (
        <div>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />

          <div className="absolute top-full left-4 right-4 mt-2 bg-background border rounded-md shadow-lg p-4 lg:hidden animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">{t('navbar.settingsButton')}</span>
                  <div className="flex items-center gap-1">
                    <LanguageSwitcher/>
                    <GithubRepoIcon />
                    <ColorThemeSwitcher/>
                    <ThemeSwitcher />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link to="/auth/login" onClick={closeMobileMenu}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-center text-foreground"
                    >
                      {t('navbar.loginButton')}
                    </Button>
                  </Link>
                  <Link to="/auth/register" onClick={closeMobileMenu}>
                    <Button 
                      size="sm" 
                      className="w-full justify-center bg-foreground text-background hover:bg-foreground/90"
                    >
                      {t('navbar.signUpButton')}
                    </Button>
                  </Link>
                </div>
              </div>
          </div></div>
        )}
    </div>
  );
}

export default Navbar;
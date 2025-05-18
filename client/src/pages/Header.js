// pages/Header.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import styles from "../styles/Header.module.css";
import logo from "../assets/logo.png";
import cartIcon from "../assets/cart.png";
import wishlistIcon from "../assets/wishlist.png";
import loginIcon from "../assets/login.png";
import { useTranslation } from "react-i18next";
import { IoMdContacts } from "react-icons/io";
import { MdWork } from "react-icons/md";
import { FaIndustry } from "react-icons/fa";
import { FaNewspaper } from "react-icons/fa";
import { FaPercent } from "react-icons/fa";

const Header = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);
  
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <header className={styles["header-container"]}>
      <div className={styles["header-inner"]}>
        <div className={styles.headerLeftSection}>
        <Link to="/">
          <img src={logo} alt="Logo" className={styles.headerLogo} />
        </Link>
          <div className={styles.headerUserInfo}>
          <p className={styles.headerUsername}>
            {t("header.hello")}, {user?.username || t("header.guest")}
          </p>
                    
            {user && (
              <button className={styles.logoutButton} onClick={handleLogout}>
                🔓 Logout
              </button>
            )}
          </div>
        </div>

        <nav className={styles["header-nav"]}>
        <Link to="/contact">{t("header.contact")}</Link>
        <Link to="/jobs">{t("header.jobs")}</Link>
        <Link to="/brands">{t("header.brands")}</Link>
        <Link to="/articles">{t("header.articles")}</Link>
        <Link to="/sales">{t("header.sales")}</Link>
        <Link to="/storeslist">{t("header.stores")}</Link>

        {!user && <Link to="/register">{t("header.register")}</Link>}
        {user?.role === "admin" && <Link to="/admin">{t("header.admin")}</Link>}
        </nav>

        <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

          <div className={styles["header-rightSection"]}>
          {/* עגלת קניות */}
          <Link to="/cart" className={styles["header-icon"]}>
            <img src={cartIcon} alt="Cart" />
            {cartCount > 0 && (
              <span className={styles["header-cartCount"]}>{cartCount}</span>
            )}
          </Link>

          {/* רשימת משאלות */}
          <Link to="/wishlist" className={styles["header-icon"]}>
            <img src={wishlistIcon} alt="Wishlist" />
          </Link>

          {/* התחברות */}
          <Link to="/login" className={styles["header-icon"]}>
            <img src={loginIcon} alt="Login" />
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" onClick={closeMenu}><span>&gt;</span> {t("header.home")}</Link>
          <Link to="/products" onClick={closeMenu}><span>&gt;</span> {t("header.products")}</Link>
          <Link to="/brands" onClick={closeMenu}><span>&gt;</span> {t("header.brands")}</Link>
          <Link to="/contact" onClick={closeMenu}><span>&gt;</span> {t("header.contact")}</Link>

          {!user && (<Link to="/login" onClick={closeMenu}><span>&gt;</span> {t("header.login")} </Link>)}
          {!user && (<Link to="/register" onClick={closeMenu}><span>&gt;</span> {t("header.register")}</Link>)}
          {user?.role === "admin" && (<Link to="/admin" onClick={closeMenu}><span>&gt;</span> {t("header.admin")}</Link>)}
          <hr />
          <p className={styles.categoryTitle}>Categories</p>
          <Link to="/products?category=garden-tools" onClick={closeMenu}><span>&gt;</span> Garden Tools</Link>
          <Link to="/products?category=irrigation" onClick={closeMenu}><span>&gt;</span> Irrigation</Link>
          <Link to="/products?category=fertilising" onClick={closeMenu}><span>&gt;</span> Fertilising</Link>
          <Link to="/products?category=pest-control" onClick={closeMenu}><span>&gt;</span> Pest Control</Link>
        </div>
      )}
    </header>
  );
};

export default Header;

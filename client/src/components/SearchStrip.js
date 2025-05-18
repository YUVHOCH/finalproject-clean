// src/components/SearchStrip.js
import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/SearchStrip.module.css";
import { FaSearch, FaBars, FaRobot } from "react-icons/fa";
import { useSearch } from "../context/SearchContext";
import { useMenu } from "../context/MenuContext";
import { useCategories } from "../context/CategoryContext";
import CategoryMenu from "./CategoryMenu";
import { useNavigate } from "react-router-dom";
import AISearchModal from './AISearchModal';

const SearchStrip = () => {
  const { setSearchTerm } = useSearch();
  const { isMenuOpen, toggleMenu } = useMenu();
  const { categoryTree, getCategoryTree } = useCategories();
  const [localTerm, setLocalTerm] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [showAISearch, setShowAISearch] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    // רק אם אין קטגוריות במטמון, נטען אותן
    if (categoryTree.length === 0) {
      getCategoryTree();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        toggleMenu();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") toggleMenu();
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen, toggleMenu]);

  const handleInputChange = (e) => {
    setLocalTerm(e.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(localTerm.trim());
    navigate("/products");
    if (isMenuOpen) toggleMenu();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAISearch = () => {
    setIsAIModalOpen(true);
  };

  return (
    <>
      <div className={styles.stripWrapper}>
        <div className={styles.menuTriggerWrapper}>
          <div className={styles.iconWrapper}>
            <button
              className={styles.hamburgerButton}
              onClick={toggleMenu}
            >
              <FaBars />
            </button>

            {isMenuOpen && (
              <div className={styles.menuWrapper} ref={menuRef}>
                <CategoryMenu closeMenu={toggleMenu} />
              </div>
            )}
          </div>

          <span
            className={styles.categoriesLabel}
            onClick={toggleMenu}
          >
            כל הקטגוריות
          </span>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="אני רוצה לקנות..."
            className={styles.searchInput}
            value={localTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.searchIcons}>
            <FaSearch className={styles.searchIcon} onClick={handleSearch} />
            <FaRobot 
              className={styles.aiSearchIcon} 
              onClick={handleAISearch}
              title="חיפוש חכם באמצעות AI"
            />
          </div>
        </div>
      </div>
      
      <AISearchModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
};

export default SearchStrip;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { AuthForm } from "../AuthForm/AuthForm";
import { Modal } from "../Modal/Modal";

import styles from "./Header.module.css";
import profileIcon from "../../assets/Profile.svg";
import arrowIcon from "../../assets/Arrow.svg";

export function Header() {
  const { user, logout } = useAuth();

  

  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const userName = user?.email?.split("@")[0] ?? "Пользователь";

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="SkyFitnessPro" />
          <span>Онлайн-тренировки для занятий дома</span>
        </Link>

        {user ? (
          <div className={styles.userWrap}>
            <button
  type="button"
  className={styles.userButton}
  aria-expanded={menuOpen}
  aria-label="Открыть меню пользователя"
  onClick={() => setMenuOpen((isOpen) => !isOpen)}
>
  <img
    src={profileIcon}
    alt=""
    className={styles.profileIcon}
  />

  <span className={styles.userName}>
    {userName}
  </span>

  <img
    src={arrowIcon}
    alt=""
    className={`${styles.arrowIcon} ${
      menuOpen ? styles.arrowIconOpen : ""
    }`}
  />
</button>

            {menuOpen && (
              <div className={styles.menu}>
                <strong className={styles.menuEmail}>
                  {user.email}
                </strong>

                <button type="button" onClick={handleProfileClick}>
                  Мой профиль
                </button>

                <button type="button" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={styles.loginButton}
            onClick={() => setAuthOpen(true)}
          >
            Войти
          </button>
        )}
      </header>

      {authOpen && (
        <Modal onClose={() => setAuthOpen(false)}>
          <AuthForm onSuccess={() => setAuthOpen(false)} />
        </Modal>
      )}
    </>
  );
}
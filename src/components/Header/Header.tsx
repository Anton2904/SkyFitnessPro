import { Link } from "react-router-dom";

import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo} >
                <img src="src/assets/logo.svg" alt="Logo" />
                <p className={styles.subtitle}>Онлайн-тренировки для занятий дома</p>
            </Link>
            
                

            <Link to="/login" className={styles.loginButton}>
                Войти
            </Link>
        </header>
    );
}
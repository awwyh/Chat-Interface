import styles from './Header.module.css';

const Header = ({ onSearchClick }) => {
  return (
    <header className={styles.header}>
<button className={styles.backButton}>
  <svg viewBox="0 0 34 34" width="40" height="40">
    <path fill="#8E64F2" d="M20 17H7.83l5.59-5.59L12 10l-8 8 8 8 1.41-1.41L7.83 19H20v-2z"/>
  </svg>
</button>
      
      <div className={styles.avatar}>
        <img src="https://sun9-32.userapi.com/impg/eLjJ_foU-Pa35eHdEL07a4oQr8T49k3mTTcp7w/HV5xlmfCbL4.jpg?size=1620x2160&quality=95&sign=4d2f4076ed4712cf58f4f91951b8e19c&type=album" alt="User avatar" />
      </div>
      
      <div className={styles.userInfo}>
        <h1 className={styles.username}>Dissa</h1>
        <p className={styles.status}>был(а) в сети вчера</p>
      </div>
      
      <button
        className={styles.searchIcon}
        onClick={onSearchClick}
        aria-label="Поиск"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" stroke="#825CDC" strokeWidth="2" fill="none"/>
          <line x1="17" y1="17" x2="21" y2="21" stroke="#825CDC" strokeWidth="2"/>
        </svg>
      </button>
    </header>
  );
};

export default Header;
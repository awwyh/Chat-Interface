import styles from './Header.module.css';

const Header = ({ onSearchClick }) => {
  return (
    <header className={styles.header}>
      <button className={styles.backButton}>
        <svg viewBox="0 0 34 24" width="34" height="24">
          <path fill="#8E64F2" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      
      <div className={styles.avatar}>
        <img src="https://sun9-57.userapi.com/impg/y8lyvUd21BbfG5ZCABj7uFoj5xIwtuauJi19tA/5jHOk8gWlYw.jpg?size=1530x2160&quality=95&sign=d1b7c2befeab454f32a04a4721729f77&type=album" alt="User avatar" />
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
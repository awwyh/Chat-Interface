import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
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
      
      <button className={styles.searchButton}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="#fff" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
    </div>
  );
};

export default Header;
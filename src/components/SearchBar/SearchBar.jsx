import { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ messages, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Фильтруем сообщения по содержанию текста
    const filteredMessages = messages.filter((msg) => {
      if (msg.type === 'text' && msg.text.toLowerCase().includes(query)) {
        return true;
      }
      if (msg.type === 'photo' && msg.caption && msg.caption.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });

    onSearchResults(filteredMessages);
  };

  return (
    <div className={styles.searchBarWrapper}>
      <input
        type="text"
        placeholder="Поиск сообщений..."
        value={searchQuery}
        onChange={handleSearch}
        className={styles.searchBarInput}
      />
    </div>
  );
};

export default SearchBar;
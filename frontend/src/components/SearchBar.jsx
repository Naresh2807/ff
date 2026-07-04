import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({
  onSearch,
  placeholder = 'Search recipes, ingredients, cuisines...'
}) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Search Icon */}
        <Search
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            h-14
            pl-14
            pr-32
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            text-gray-700
            placeholder:text-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-orange-500
            focus:border-transparent
            transition-all
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute
              right-28
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-gray-600
              transition-colors
            "
          >
            <X size={18} />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2
            h-10
            px-5
            bg-orange-500
            hover:bg-orange-600
            text-white
            rounded-xl
            font-medium
            transition-all
            shadow-sm
          "
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
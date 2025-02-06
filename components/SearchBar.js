// components/SearchBar.js
export default function SearchBar({ search, setSearch }) {
    return (
      <input
        type="text"
        placeholder="Search by name, category, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px", width: "300px" }}
      />
    );
  }
  
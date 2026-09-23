"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Plus, Trash2, Edit2, Search, Star, Calendar } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  releaseYear: string;
  rating: string;
  stars: string;
  producer: string;
  country: string;
  quality: string;
  views: number;
}

const INITIAL_MOVIES: Movie[] = [
  {
    id: "1",
    title: "Interstellar Extended Edition",
    releaseYear: "2014",
    rating: "8.7",
    stars: "Matthew McConaughey, Anne Hathaway",
    producer: "Emma Thomas, Christopher Nolan",
    country: "United States",
    quality: "1080p",
    views: 1250,
  },
  {
    id: "2",
    title: "Inception: The Dream Realm",
    releaseYear: "2010",
    rating: "8.8",
    stars: "Leonardo DiCaprio, Joseph Gordon-Levitt",
    producer: "Christopher Nolan",
    country: "United States",
    quality: "4K",
    views: 3410,
  },
];

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newRating, setNewRating] = useState("8.0");
  const [newStars, setNewStars] = useState("");
  const [newProducer, setNewProducer] = useState("");
  const [newCountry, setNewCountry] = useState("United States");
  const [newQuality, setNewQuality] = useState("1080p");

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.stars.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setMsg("Movie deleted successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newMovie: Movie = {
      id: String(Date.now()),
      title: newTitle,
      releaseYear: newYear,
      rating: newRating,
      stars: newStars,
      producer: newProducer,
      country: newCountry,
      quality: newQuality,
      views: 0,
    };

    setMovies([newMovie, ...movies]);
    setNewTitle("");
    setNewStars("");
    setNewProducer("");
    setShowAddModal(false);
    setMsg("Movie added successfully!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-white">Manage Movies</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Movies</span>
          <span>/</span>
          <span className="text-[#04abf2]">Manage Movies</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg">
          {msg}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-[#1b1e22] border border-[#2c3136] rounded-xl overflow-hidden shadow-lg">
        {/* Card Header & Controls */}
        <div className="p-4 border-b border-[#2c3136] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search for keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2] placeholder-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Movie</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="bg-[#16191c] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#2c3136]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">ID</th>
                <th className="px-4 py-3">Movie Name</th>
                <th className="px-4 py-3">Release Year</th>
                <th className="px-4 py-3">Stars & Cast</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3136]">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#212529] transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-neutral-400">{movie.id}</td>
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#04abf2]" />
                    <span>{movie.title}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{movie.releaseYear}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 truncate max-w-xs">{movie.stars}</td>
                  <td className="px-4 py-3 text-amber-400 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono">
                      {movie.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit Movie"
                        className="p-1 hover:bg-[#2c3136] rounded text-sky-400 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Movie"
                        onClick={() => handleDelete(movie.id)}
                        className="p-1 hover:bg-[#2c3136] rounded text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Movie */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1b1e22] border border-[#2c3136] rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Movie</h3>
            <form onSubmit={handleAddMovie} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Movie Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Movie title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Release Year
                  </label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Rating (e.g. 8.5)
                  </label>
                  <input
                    type="text"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Stars & Actors
                </label>
                <input
                  type="text"
                  placeholder="Actor 1, Actor 2..."
                  value={newStars}
                  onChange={(e) => setNewStars(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Producer
                  </label>
                  <input
                    type="text"
                    placeholder="Producer name"
                    value={newProducer}
                    onChange={(e) => setNewProducer(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Quality
                  </label>
                  <select
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                  >
                    <option value="4K">4K</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-xs bg-[#2c3136] hover:bg-[#383f46] text-white rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#04abf2] hover:bg-[#039be5] text-white font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

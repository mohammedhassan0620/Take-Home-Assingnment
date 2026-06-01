import React, { useState, useEffect } from 'react';
import './App.css';

// ── Helper: render star string from rating out of 10 ──────────────────────────
function ratingStars(vote_average) {
  const filled = Math.round(vote_average / 2); // convert /10 → /5
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

// ── Helper: parse the dd/mm/yy date format in the dataset ────────────────────
function parseMovieDate(dateStr) {
  if (!dateStr) return null;
  // Format is "30/10/95" → day/month/year(2-digit)
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const fullYear = parseInt(year, 10) < 50 ? 2000 + parseInt(year, 10) : 1900 + parseInt(year, 10);
  return new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
}

// ── Movie List Page ───────────────────────────────────────────────────────────
function MovieList({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch('/api/movies');
        if (!res.ok) throw new Error('Failed to fetch movies');
        const payload = await res.json();
        setMovies(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading movies…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-msg">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">🎬 Movies</h1>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => onSelectMovie(movie.id)}
          >
            <div className="card-poster">🎥</div>
            <div className="card-body">
              <div className="card-title">{movie.title}</div>
              <div className="card-tagline">
                {movie.tagline || <em style={{ color: '#555' }}>No tagline</em>}
              </div>
              <div className="card-rating">
                <span className="rating-badge">⭐ {movie.vote_average} / 10</span>
                <span className="rating-stars">{ratingStars(movie.vote_average)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Movie Detail Page ─────────────────────────────────────────────────────────
function MovieDetail({ movieId, onBack }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) throw new Error('Movie not found');
        const payload = await res.json();
        setMovie(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading movie…</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <p className="error-msg">⚠️ {error || 'Movie not found'}</p>
        <button className="back-btn" onClick={onBack}>← Back to list</button>
      </div>
    );
  }

  // Localize release date using browser's locale
  const parsedDate = parseMovieDate(movie.release_date);
  const localizedDate = parsedDate
    ? parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : movie.release_date;

  // Runtime in hours and minutes
  const runtimeHours = Math.floor(movie.runtime / 60);
  const runtimeMins = movie.runtime % 60;
  const runtimeStr = runtimeHours > 0
    ? `${runtimeHours}h ${runtimeMins}m (${movie.runtime} min)`
    : `${movie.runtime} min`;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to movies
      </button>

      <div className="detail-hero">
        <h1 className="detail-title">{movie.title}</h1>
        {movie.original_title && movie.original_title !== movie.title && (
          <div className="detail-original-title">Original title: {movie.original_title}</div>
        )}
        {movie.tagline && (
          <div className="detail-tagline">"{movie.tagline}"</div>
        )}

        <div className="detail-meta">
          <div className="meta-badge rating">
            <span className="label">Rating</span>
            <span className="value">⭐ {movie.vote_average} / 10</span>
          </div>
          <div className="meta-badge">
            <span className="label">Votes</span>
            <span className="value">{movie.vote_count?.toLocaleString()}</span>
          </div>
          <div className="meta-badge">
            <span className="label">Runtime</span>
            <span className="value">{runtimeStr}</span>
          </div>
          <div className="meta-badge">
            <span className="label">Status</span>
            <span className="value">{movie.status}</span>
          </div>
          <div className="meta-badge">
            <span className="label">Release Date</span>
            <span className="value">{localizedDate}</span>
          </div>
        </div>
      </div>

      {movie.overview && (
        <div className="detail-section">
          <div className="section-heading">Overview</div>
          <p className="detail-overview">{movie.overview}</p>
        </div>
      )}

      <div className="detail-section">
        <div className="section-heading">All Details</div>
        <div className="detail-fields">
          <div className="field-item">
            <div className="field-label">Movie ID</div>
            <div className="field-value">{movie.id}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Title</div>
            <div className="field-value">{movie.title}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Original Title</div>
            <div className="field-value">{movie.original_title}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Tagline</div>
            <div className="field-value">{movie.tagline || '—'}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Release Date</div>
            <div className="field-value">{localizedDate}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Runtime</div>
            <div className="field-value">{runtimeStr}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Vote Average</div>
            <div className="field-value">{movie.vote_average} / 10 &nbsp; {ratingStars(movie.vote_average)}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Vote Count</div>
            <div className="field-value">{movie.vote_count?.toLocaleString()}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Status</div>
            <div className="field-value">{movie.status}</div>
          </div>
          <div className="field-item">
            <div className="field-label">Overview</div>
            <div className="field-value">{movie.overview || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <span className="logo" onClick={() => setSelectedMovieId(null)}>
            🎬 MovieDB
          </span>
        </div>
      </header>

      <main className="main-content">
        {selectedMovieId === null ? (
          <MovieList onSelectMovie={setSelectedMovieId} />
        ) : (
          <MovieDetail
            movieId={selectedMovieId}
            onBack={() => setSelectedMovieId(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;

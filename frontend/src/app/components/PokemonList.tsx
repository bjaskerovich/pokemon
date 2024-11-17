'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PokemonForm } from './PokemonForm';

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  imageUrl: string;
}

export function PokemonList() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { token, logout } = useAuth();

  const fetchPokemon = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemon`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
      }
      
      const data = await response.json();
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPokemon();
    }
  }, [token]);

  const handleCreate = async (data: Omit<Pokemon, 'id'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Pokemon');
      }

      await fetchPokemon();
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: Omit<Pokemon, 'id'>) => {
    if (!selectedPokemon) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pokemon/${selectedPokemon.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Pokemon');
      }

      await fetchPokemon();
      setSelectedPokemon(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this Pokemon?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pokemon/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete Pokemon');
      }

      await fetchPokemon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete Pokemon');
    }
  };

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setError('');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pokemon/initialize`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize Pokemon data');
      }

      await fetchPokemon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Pokemon');
    } finally {
      setIsInitializing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Form view
  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">
          {selectedPokemon ? 'Edit Pokemon' : 'Create New Pokemon'}
        </h2>
        <PokemonForm
          initialData={selectedPokemon || undefined}
          onSubmit={selectedPokemon ? handleUpdate : handleCreate}
          onCancel={() => {
            setSelectedPokemon(null);
            setShowForm(false);
          }}
        />
      </div>
    );
  }

  // Empty state
  if (pokemon.length === 0 && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pokemon Collection</h1>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
        
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">No Pokemon Found</h2>
            <p className="text-gray-600 mb-4">
              You can add Pokemon manually or initialize with data from PokeAPI.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Add Pokemon Manually
              </button>
              <button
                onClick={handleInitialize}
                className="btn btn-secondary"
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <span className="flex items-center">
                    <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Initializing...
                  </span>
                ) : (
                  'Initialize with PokeAPI'
                )}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pokemon Collection</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Add Pokemon
          </button>
          <button
            onClick={handleInitialize}
            className="btn btn-secondary"
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Refresh Data'}
          </button>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message mb-4">{error}</div>}

      <div className="pokemon-grid">
        {pokemon.map((p) => (
          <div key={p.id} className="card pokemon-card relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setSelectedPokemon(p);
                    setShowForm(true);
                  }}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-32 h-32 mx-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/pokemon-placeholder.png';
                }}
              />
              <h2 className="text-xl font-bold capitalize text-center mt-4 mb-2">
                {p.name}
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {p.types.map((type) => (
                  <span
                    key={type}
                    className={`type-badge type-${type.toLowerCase()}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

interface PokemonFormProps {
  initialData?: {
    id?: number;
    name: string;
    types: string[];
    imageUrl: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function PokemonForm({ initialData, onSubmit, onCancel }: PokemonFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [types, setTypes] = useState(initialData?.types.join(', ') || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        types: types.split(',').map(type => type.trim()),
        imageUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Pokemon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="error-message">{error}</div>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="types" className="block text-sm font-medium text-gray-700">
          Types (comma-separated)
        </label>
        <input
          type="text"
          id="types"
          value={types}
          onChange={(e) => setTypes(e.target.value)}
          className="input mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="input mt-1"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
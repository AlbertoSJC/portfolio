import apiService from 'src/services/apiService';
import { mockSuperheroData } from '@tests/mocks/superheroMocks';
import axios from 'axios';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch api key details successfully', async () => {
    const mockKey = { id: 'key-1', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockKey });

    const result = await apiService.fetchApiKeyDetails();

    expect(axios.get).toHaveBeenCalled();
    expect(result).toEqual(mockKey);
  });

  test('should fetch superheroes list successfully', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [mockSuperheroData] });

    const result = await apiService.fetchSuperHeroesList();

    expect(axios.get).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(mockSuperheroData.name);
  });

  test('should fetch superheroes list with Authorization header', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

    await apiService.fetchSuperHeroesList();

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) }),
    );
  });

  test('should post a superhero successfully', async () => {
    const newHero = { ...mockSuperheroData, id: '99' };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: newHero });

    const result = await apiService.postSuperhero(mockSuperheroData as any);

    expect(axios.post).toHaveBeenCalled();
    expect(result.id).toBe('99');
  });

  test('should update a superhero successfully', async () => {
    const updatedHero = { ...mockSuperheroData, name: 'Updated Hero' };
    vi.mocked(axios.put).mockResolvedValueOnce({ data: updatedHero });

    const result = await apiService.updateSuperhero(mockSuperheroData as any);

    expect(axios.put).toHaveBeenCalled();
    expect(result.name).toBe('Updated Hero');
  });

  test('should delete a superhero successfully', async () => {
    vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });

    await apiService.deleteSuperhero(mockSuperheroData as any);

    expect(axios.delete).toHaveBeenCalled();
  });

  test('should throw when fetchSuperHeroesList fails', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'));

    await expect(apiService.fetchSuperHeroesList()).rejects.toThrow('Network Error');
  });

  test('should throw when postSuperhero fails', async () => {
    const serviceError = { response: { data: { message: 'Bad Request' } } };
    vi.mocked(axios.post).mockRejectedValueOnce(serviceError);

    await expect(apiService.postSuperhero(mockSuperheroData as any)).rejects.toEqual(serviceError);
  });
});

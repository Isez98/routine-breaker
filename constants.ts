
import type { Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Gym',
    activityDuration: 60, // 1 hour
    timeRange: { start: '06:00', end: '18:00' }, // Early morning
    repetitions: 1,
    allowConsecutive: false,
    activities: [
      { id: 'act-1-1', location: 'Agustín de Iturbide 320, Lagos y Ríos, 83550 Puerto Peñasco, Son.' },
      { id: 'act-1-2', location: 'C. 24 Lazaro Cardenas del Río, Centro, 83550 Puerto Peñasco, Son.' },
      { id: 'act-1-3', location: 'Eduardo Ibarra y oriente, 83557 Puerto Peñasco, Son.' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Coffee',
    activityDuration: 30, // 30 minutes
    timeRange: { start: '08:00', end: '18:00' }, // All day availability
    repetitions: 2, // Morning and afternoon coffee
    allowConsecutive: false,
    activities: [
      { id: 'act-2-1', location: 'C. 24 Lazaro Cardenas del Río, Centro, 83550 Puerto Peñasco, Son.' },
      { id: 'act-2-2', location: 'Agustin Melgar y Simon Morua S/N, 83550 Puerto Peñasco, Son.' },
      { id: 'act-2-3', location: 'Blvd. Benito Juárez García 319, Centro, 83550 Puerto Peñasco, Son.' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Library',
    activityDuration: 90, // 1.5 hours
    timeRange: { start: '09:00', end: '17:00' }, // Library hours
    repetitions: 1,
    allowConsecutive: false,
    activities: [
      { id: 'act-3-1', location: 'Boulevard Benito Juárez García, Recinto Portuario, 83554 Puerto Peñasco, Son.' },
      { id: 'act-3-2', location: 'C. Miguel Hidalgo y Costilla 268, Oriente, 83553 Puerto Peñasco, Son.' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Lunch',
    activityDuration: 45, // 45 minutes
    timeRange: { start: '11:00', end: '15:00' }, // Lunch hours
    repetitions: 1,
    allowConsecutive: false,
    activities: [
      { id: 'act-4-1', location: 'Av. Constitución S/N, Centro, 83550 Puerto Peñasco, Son.' },
      { id: 'act-4-2', location: 'C. Álvaro Obregón 132, entre Blvd. Bénito Juárez y Blvd. Kino, Centro, 83550 Puerto Peñasco, Son.' },
      { id: 'act-4-3', location: 'Blvd. Benito Juárez García 216 B, El Puerto, 83550 Puerto Peñasco, Son.' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Park',
    activityDuration: 60, // 1 hour
    timeRange: { start: '07:00', end: '19:00' }, // Daylight hours
    repetitions: 1,
    allowConsecutive: false,
    activities: [
      { id: 'act-5-1', location: 'Benito Juárez, 83554 Puerto Peñasco, Sonora' },
      { id: 'act-5-2', location: '83550, Adolfo López Mateos SN-S PARQUE, Centro, Puerto Peñasco, Son.' },
      { id: 'act-5-3', location: 'León de la Barrera 412-419, Josefa Ortíz de Dominguéz, 83553 Puerto Peñasco, Son.' },
    ],
  },
];

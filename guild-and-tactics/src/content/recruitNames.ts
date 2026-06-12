import type { RaceIdentifier } from '../sim/units/Unit';

/** Lore-voiced name pools for recruitment-hall candidates (see LORE.md). */
export const RECRUIT_NAMES_BY_RACE: Record<RaceIdentifier, readonly string[]> = {
  human: ['Aldous', 'Mera', 'Tomas', 'Elsbeth', 'Roderic', 'Anneke', 'Corvin', 'Isolde'],
  werecat: ['Nyari', 'Sefu', 'Mirri', 'Tassel', 'Kyree', 'Pavva', 'Shenzi', 'Orris'],
  werelizard: ['Brakkar', 'Zhussk', 'Ghorma', 'Thurzz', 'Skarn', 'Vexxa', 'Drosk', 'Umma'],
  undead: ['Vexley', 'Hollis', 'Dreyna', 'Carrow', 'Maddox', 'Sorrel', 'Wrenn', 'Calder'],
  feryan: ['Kirrah', 'Veyra', 'Stryx', 'Kaelin', 'Torvi', 'Aersa', 'Rikkel', 'Shrike'],
};

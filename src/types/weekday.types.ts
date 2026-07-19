/** 1 = lunes, 2 = martes, 3 = miércoles, 4 = jueves, 5 = viernes, 6 = sábado, 7 = domingo */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

export const WEEKDAY_FULL_NAMES: Record<Weekday, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

/** Single letter for day-picker buttons: L M M J V S D */
export const WEEKDAY_BUTTON_LABELS: Record<Weekday, string> = {
  1: 'L',
  2: 'M',
  3: 'M',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

/** Short abbreviations used in schedule summaries (Spanish). */
export const WEEKDAY_ABBR: Record<Weekday, string> = {
  1: 'Lun.',
  2: 'Mar.',
  3: 'Mié.',
  4: 'Jue.',
  5: 'Vie.',
  6: 'Sáb.',
  7: 'Dom.',
};

import type { MedicationType } from '../../types/medication.types';

export interface MedicationTypeOption {
  value: MedicationType;
  label: string;
  description: string;
}

export const MEDICATION_TYPE_OPTIONS: MedicationTypeOption[] = [
  {
    value: 'tablet',
    label: 'Pastilla',
    description: 'Tabletas o comprimidos',
  },
  {
    value: 'capsule',
    label: 'Cápsula',
    description: 'Cápsulas blandas o duras',
  },
  {
    value: 'syrup',
    label: 'Jarabe',
    description: 'Medicamento líquido',
  },
  {
    value: 'injection',
    label: 'Inyección',
    description: 'Aplicación inyectable',
  },
  {
    value: 'drops',
    label: 'Gotas',
    description: 'Gotas orales, nasales, óticas u oftálmicas',
  },
  {
    value: 'insulin',
    label: 'Insulina',
    description: 'Aplicación de insulina indicada por el médico',
  },
  {
    value: 'other',
    label: 'Otro',
    description: 'Otro tipo de medicamento o tratamiento',
  },
];

export const DEFAULT_MEDICATION_TYPE: MedicationType = 'tablet';

export interface Workshop {
  id: number;
  propietario_id?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  marcas_soportadas: string[];
  lat: number;
  lng: number;
  certificado: boolean;
  verificado?: boolean;
  notas?: string;
  creado_en: string;
  categoria: string;
  rating: number;
  reviews: number;
}

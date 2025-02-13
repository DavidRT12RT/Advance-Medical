export enum UnidadStatus {
  Disponible = 'Disponible',
  EnRuta = 'En Ruta',
  Mantenimiento = 'En Mantenimiento',
  FueraDeServicio = 'Fuera de Servicio'
}

export const UnidadStatusColor: Record<UnidadStatus, string> = {
  [UnidadStatus.Disponible]: 'processing',
  [UnidadStatus.EnRuta]: 'gold',
  [UnidadStatus.Mantenimiento]: 'yellow',
  [UnidadStatus.FueraDeServicio]: 'error'
};

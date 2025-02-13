export enum CompraStatus {
    Pendiente = 'Pendiente',
    PendienteInformacion = 'Pendiente de información',
    Transito = 'Tránsito',
    Rechazado = 'Rechazado',
    Terminada = 'Terminada',
    Incompleta = 'Incompleta'
}

export const CompraStatusColor: Record<CompraStatus, string> = {
    [CompraStatus.Pendiente]: 'processing',
    [CompraStatus.PendienteInformacion]: 'purple',
    [CompraStatus.Transito]: 'orange',
    [CompraStatus.Rechazado]: 'error',
    [CompraStatus.Terminada]: 'success',
    [CompraStatus.Incompleta]: 'warning'
};

export enum CXPStatus {
    Pendiente = 'Pendiente',
    PendienteInformacion = 'Pendiente de información',
    PendienteDePago = 'Pendiente de pago',
    Completa = 'Completa',
}

export const CXPStatusColor: Record<CXPStatus, string> = {
    [CXPStatus.Pendiente]: 'processing',
    [CXPStatus.PendienteInformacion]: 'purple',
    [CXPStatus.PendienteDePago]: 'orange',
    [CXPStatus.Completa]: 'success',
};


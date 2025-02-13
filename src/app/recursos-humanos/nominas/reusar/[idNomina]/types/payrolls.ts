export interface Query {
    idNomina: string;
}
export interface Params {
    params: Query;
}
export interface Payroll {
    id: string;
    idColaborador: string;
    ajustes: string;
    diasDeFaltas: string;
    diasDeTrabajo: string;
    diasFestivosTrabajados: string;
    permisosSinGoceDeSueldo: string;
    primaDominical: string;
    adicionales: string[];
    incapacidades: string[];
}
export interface PayrollColaborators {
    idColaborador: string;
    dataFormNomina: Payroll;
    colaborador: any[];
}
export interface Response {
    id: string;
    estatus: string;
    usuario: string;
    usuarioResponsable: string;
    fechaRegistro: Date;
    fechaRegistroDoc: string;
    eliminado: boolean;
    colaboradoresNominas: PayrollColaborators[];
}
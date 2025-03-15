export class CreateTransactionDto {
    monto: number;
    descripcion: string;
    fecha: string;
    tipo: string;
    userId: number; // ← Campo correcto
  }
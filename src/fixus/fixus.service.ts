import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { Person } from './entities/person.entity';
import { TrainerCode } from './entities/trainer-code.entity';
import { TrainerRequest, RequestStatus } from './entities/trainer-request.entity';
import { LinkedTrainer } from './entities/linked-trainer.entity';

@Injectable()
export class FixusService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(TrainerCode)
    private trainerCodeRepository: Repository<TrainerCode>,
    @InjectRepository(TrainerRequest)
    private trainerRequestRepository: Repository<TrainerRequest>,
    @InjectRepository(LinkedTrainer)
    private linkedTrainerRepository: Repository<LinkedTrainer>,
  ) {}

  // ===================== ROUTINES =====================

  async createRoutine(userId: number, createRoutineDto: any): Promise<Routine> {
    const routine = this.routineRepository.create({
      userId,
      ...createRoutineDto,
    });
    const saved = await this.routineRepository.save(routine);
    return saved as unknown as Routine;
  }

  async getRoutinesByUser(userId: number): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async getRoutineById(userId: number, routineId: number): Promise<Routine> {
    const routine = await this.routineRepository.findOne({
      where: { id: routineId, userId },
    });
    if (!routine) {
      throw new BadRequestException('Routine not found');
    }
    return routine;
  }

  async updateRoutine(userId: number, routineId: number, updateDto: any): Promise<Routine> {
    const routine = await this.getRoutineById(userId, routineId);
    Object.assign(routine, updateDto);
    const saved = await this.routineRepository.save(routine);
    return saved as unknown as Routine;
  }

  async deleteRoutine(userId: number, routineId: number): Promise<void> {
    const routine = await this.getRoutineById(userId, routineId);
    await this.routineRepository.remove(routine);
  }

  async getRoutinesByPerson(userId: number, personId: string): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { userId, personId },
      order: { date: 'DESC' },
    });
  }

  // ===================== PERSONS =====================

  async createPerson(userId: number, createPersonDto: any): Promise<Person> {
    const person = this.personRepository.create({
      userId,
      ...createPersonDto,
    });
    const saved = await this.personRepository.save(person);
    return saved as unknown as Person;
  }

  async getPersonsByTrainer(userId: number): Promise<Person[]> {
    return await this.personRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPersonById(userId: number, personId: number): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id: personId, userId },
    });
    if (!person) {
      throw new BadRequestException('Person not found');
    }
    return person;
  }

  async updatePerson(userId: number, personId: number, updateDto: any): Promise<Person> {
    const person = await this.getPersonById(userId, personId);
    Object.assign(person, updateDto);
    const saved = await this.personRepository.save(person);
    return saved as unknown as Person;
  }

  async deletePerson(userId: number, personId: number): Promise<void> {
    const person = await this.getPersonById(userId, personId);
    await this.personRepository.remove(person);
  }

  // ===================== TRAINER CODES =====================

  async getOrCreateTrainerCode(userId: number): Promise<TrainerCode> {
    let trainerCode = await this.trainerCodeRepository.findOne({
      where: { userId },
    });

    if (!trainerCode) {
      // Generar código único: NDX-A1B2C3D4
      const code = 'NDX-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const newCode = this.trainerCodeRepository.create({
        userId,
        code,
      });
      const saved = await this.trainerCodeRepository.save(newCode);
      trainerCode = saved as unknown as TrainerCode;
    }

    return trainerCode;
  }

  async getTrainerCodeByCode(code: string): Promise<TrainerCode> {
    const trainerCode = await this.trainerCodeRepository.findOne({
      where: { code },
    });
    if (!trainerCode) {
      throw new BadRequestException('Invalid trainer code');
    }
    return trainerCode;
  }

  // ===================== TRAINER REQUESTS =====================

  async createTrainerRequest(trainerId: number, createRequestDto: any): Promise<TrainerRequest> {
    const request = this.trainerRequestRepository.create({
      trainerId,
      ...createRequestDto,
    });
    const saved = await this.trainerRequestRepository.save(request);
    return saved as unknown as TrainerRequest;
  }

  async getTrainerRequestsByEmail(clientEmail: string): Promise<TrainerRequest[]> {
    return await this.trainerRequestRepository.find({
      where: { clientEmail, status: RequestStatus.PENDING },
      relations: ['trainer'],
    });
  }

  async getTrainerRequestById(requestId: number): Promise<TrainerRequest> {
    const request = await this.trainerRequestRepository.findOne({
      where: { id: requestId },
      relations: ['trainer'],
    });
    if (!request) {
      throw new BadRequestException('Request not found');
    }
    return request;
  }

  async acceptTrainerRequest(requestId: number, clientId: number): Promise<LinkedTrainer> {
    const request = await this.getTrainerRequestById(requestId);

    // Crear relación LinkedTrainer
    const linkedTrainer = this.linkedTrainerRepository.create({
      clientId,
      trainerId: request.trainerId,
      trainerName: request.trainer?.name,
      trainerEmail: request.trainer?.email,
      trainerCode: request.trainerCode,
      routines: request.routines,
    });
    const savedLinked = await this.linkedTrainerRepository.save(linkedTrainer) as unknown as LinkedTrainer;

    // Actualizar estado de la solicitud
    request.status = RequestStatus.ACCEPTED;
    await this.trainerRequestRepository.save(request);

    return savedLinked;
  }

  async rejectTrainerRequest(requestId: number): Promise<void> {
    const request = await this.getTrainerRequestById(requestId);
    request.status = RequestStatus.REJECTED;
    await this.trainerRequestRepository.save(request);
  }

  // ===================== LINKED TRAINERS =====================

  async getLinkedTrainerByClient(clientId: number): Promise<LinkedTrainer | null> {
    return await this.linkedTrainerRepository.findOne({
      where: { clientId },
    });
  }

  async updateLinkedTrainerRoutines(linkedTrainerId: number, routines: any[]): Promise<LinkedTrainer> {
    const linked = await this.linkedTrainerRepository.findOne({
      where: { id: linkedTrainerId },
    });
    if (!linked) {
      throw new BadRequestException('Linked trainer not found');
    }
    linked.routines = routines;
    const saved = await this.linkedTrainerRepository.save(linked);
    return saved as unknown as LinkedTrainer;
  }
}

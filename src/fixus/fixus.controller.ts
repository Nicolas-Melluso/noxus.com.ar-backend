import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FixusService } from './fixus.service';

@Controller('fixus')
export class FixusController {
  constructor(private readonly fixusService: FixusService) {}

  // ===================== ROUTINES =====================

  @Post('routines')
  @UseGuards(JwtAuthGuard)
  async createRoutine(@Request() req, @Body() createRoutineDto: any) {
    return await this.fixusService.createRoutine(req.user.id, createRoutineDto);
  }

  @Get('routines')
  @UseGuards(JwtAuthGuard)
  async getRoutines(@Request() req) {
    return await this.fixusService.getRoutinesByUser(req.user.id);
  }

  @Get('routines/:id')
  @UseGuards(JwtAuthGuard)
  async getRoutine(@Request() req, @Param('id') id: string) {
    return await this.fixusService.getRoutineById(req.user.id, parseInt(id));
  }

  @Put('routines/:id')
  @UseGuards(JwtAuthGuard)
  async updateRoutine(@Request() req, @Param('id') id: string, @Body() updateRoutineDto: any) {
    return await this.fixusService.updateRoutine(req.user.id, parseInt(id), updateRoutineDto);
  }

  @Delete('routines/:id')
  @UseGuards(JwtAuthGuard)
  async deleteRoutine(@Request() req, @Param('id') id: string) {
    await this.fixusService.deleteRoutine(req.user.id, parseInt(id));
    return { message: 'Routine deleted' };
  }

  @Get('routines/person/:personId')
  @UseGuards(JwtAuthGuard)
  async getRoutinesByPerson(@Request() req, @Param('personId') personId: string) {
    return await this.fixusService.getRoutinesByPerson(req.user.id, personId);
  }

  // ===================== PERSONS =====================

  @Post('persons')
  @UseGuards(JwtAuthGuard)
  async createPerson(@Request() req, @Body() createPersonDto: any) {
    return await this.fixusService.createPerson(req.user.id, createPersonDto);
  }

  @Get('persons')
  @UseGuards(JwtAuthGuard)
  async getPersons(@Request() req) {
    return await this.fixusService.getPersonsByTrainer(req.user.id);
  }

  @Get('persons/:id')
  @UseGuards(JwtAuthGuard)
  async getPerson(@Request() req, @Param('id') id: string) {
    return await this.fixusService.getPersonById(req.user.id, parseInt(id));
  }

  @Put('persons/:id')
  @UseGuards(JwtAuthGuard)
  async updatePerson(@Request() req, @Param('id') id: string, @Body() updatePersonDto: any) {
    return await this.fixusService.updatePerson(req.user.id, parseInt(id), updatePersonDto);
  }

  @Delete('persons/:id')
  @UseGuards(JwtAuthGuard)
  async deletePerson(@Request() req, @Param('id') id: string) {
    await this.fixusService.deletePerson(req.user.id, parseInt(id));
    return { message: 'Person deleted' };
  }

  // ===================== TRAINER CODES =====================

  @Get('trainer-code')
  @UseGuards(JwtAuthGuard)
  async getTrainerCode(@Request() req) {
    return await this.fixusService.getOrCreateTrainerCode(req.user.id);
  }

  @Post('validate-trainer-code')
  async validateTrainerCode(@Body() body: { code: string }) {
    const trainerCode = await this.fixusService.getTrainerCodeByCode(body.code);
    return { valid: true, trainerId: trainerCode.userId };
  }

  // ===================== TRAINER REQUESTS =====================

  @Post('trainer-requests')
  @UseGuards(JwtAuthGuard)
  async createTrainerRequest(@Request() req, @Body() createRequestDto: any) {
    return await this.fixusService.createTrainerRequest(req.user.id, createRequestDto);
  }

  @Get('trainer-requests')
  async getTrainerRequests(@Query('email') email: string) {
    return await this.fixusService.getTrainerRequestsByEmail(email);
  }

  @Post('trainer-requests/:id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptTrainerRequest(@Request() req, @Param('id') id: string) {
    return await this.fixusService.acceptTrainerRequest(parseInt(id), req.user.id);
  }

  @Post('trainer-requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectTrainerRequest(@Request() req, @Param('id') id: string) {
    await this.fixusService.rejectTrainerRequest(parseInt(id));
    return { message: 'Request rejected' };
  }

  // ===================== LINKED TRAINERS =====================

  @Get('linked-trainer')
  @UseGuards(JwtAuthGuard)
  async getLinkedTrainer(@Request() req) {
    return await this.fixusService.getLinkedTrainerByClient(req.user.id);
  }

  @Put('linked-trainer/:id/routines')
  @UseGuards(JwtAuthGuard)
  async updateLinkedTrainerRoutines(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { routines: any[] },
  ) {
    return await this.fixusService.updateLinkedTrainerRoutines(parseInt(id), body.routines);
  }
}

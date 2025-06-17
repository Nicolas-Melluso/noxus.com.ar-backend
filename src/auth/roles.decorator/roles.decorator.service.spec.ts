import { Test, TestingModule } from '@nestjs/testing';
import { RolesDecoratorService } from './roles.decorator.service';

describe('RolesDecoratorService', () => {
  let service: RolesDecoratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesDecoratorService],
    }).compile();

    service = module.get<RolesDecoratorService>(RolesDecoratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

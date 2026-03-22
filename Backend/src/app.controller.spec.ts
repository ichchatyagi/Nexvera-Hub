import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './app-config/app-config.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      expect(appController.getHealth()).toBeDefined();
      expect(appController.getHealth().status).toBe('ok');
    });

    it('should return app info', () => {
      expect(appController.getInfo()).toBeDefined();
      expect(appController.getInfo().name).toBe('Nexvera Hub API');
    });
  });
});

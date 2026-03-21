import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects and bootstraps the local sqlite schema on module init', async () => {
    const execute = vi.fn().mockResolvedValue(0);
    const transaction = vi.fn().mockImplementation(async (operations) => {
      await Promise.all(operations);
      return [];
    });
    const connect = vi.fn().mockResolvedValue(undefined);

    const service = Object.create(PrismaService.prototype) as PrismaService & {
      $connect: ReturnType<typeof vi.fn>;
      $executeRawUnsafe: ReturnType<typeof vi.fn>;
      $transaction: ReturnType<typeof vi.fn>;
    };

    service.$connect = connect;
    service.$executeRawUnsafe = execute;
    service.$transaction = transaction;

    await service.onModuleInit();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS "UserSetting"'),
    );
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS "Dashboard"'),
    );
  });
});

import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('records and broadcasts new notifications', () => {
    const broadcast = jest.fn();
    const service = new NotificationsService({
      broadcast,
    } as never);

    const before = service.list();
    const item = service.record({
      title: 'Saved',
      message: 'Layout persisted',
      severity: 'info',
      source: 'dashboard',
    });
    const after = service.list();

    expect(after.items).toHaveLength(before.items.length + 1);
    expect(item.read).toBe(false);
    expect(broadcast).toHaveBeenCalledWith('notification.created', item);
  });
});

import Service, { type RoomServiceInfo } from '@domain/room-services/RoomService';

describe('Domain > Room services > RoomServices', () => {
  let service: Service;

  const serviceData: RoomServiceInfo = {
    icon: 'test-icon',
    color: 'test-color',
    temperature: 25,
    name: 'test-service',
  };

  beforeEach(() => {
    service = new Service(serviceData);
  });

  test('Should initialize with given data', () => {
    expect(service.icon).toBe(serviceData.icon);
    expect(service.color).toBe(serviceData.color);
    expect(service.temperature).toBe(serviceData.temperature);
    expect(service.name).toBe(serviceData.name);
  });

  test('Should create an empty service', () => {
    const emptyService = Service.createEmpty();
    expect(emptyService.icon).toBe('');
    expect(emptyService.color).toBe('');
    expect(emptyService.temperature).toBe(0);
    expect(emptyService.name).toBe('');
  });

  test('Should update service properties', () => {
    service.icon = 'new-icon';
    service.color = 'new-color';
    service.temperature = 30;
    service.name = 'new-service';

    expect(service.icon).toBe('new-icon');
    expect(service.color).toBe('new-color');
    expect(service.temperature).toBe(30);
    expect(service.name).toBe('new-service');
  });

  test('Should set temperature with cool air', () => {
    service.setTemperatureWithCoolAir(true);
    expect(service.temperature).toBe(18);

    service.setTemperatureWithCoolAir(false);
    expect(service.temperature).toBe(25);
  });
});

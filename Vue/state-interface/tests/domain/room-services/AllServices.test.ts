import AllServices from '@domain/room-services/AllServices';
import RoomService from '@domain/room-services/RoomService';
import type { AllServicesInfo } from '@domain/room-services/AllServices';

describe('Domain > Room services > AllServices', () => {
  let allServices: AllServices;

  const roomServiceData = {
    icon: 'test-icon',
    color: 'test-color',
    temperature: 25,
    name: 'test-service',
  };

  const allServicesData: AllServicesInfo = {
    services: [roomServiceData],
  };

  beforeEach(() => {
    allServices = new AllServices(allServicesData);
  });

  test('Should initialize with given data', () => {
    expect(allServices.services.length).toBe(1);
    expect(allServices.services[0].icon).toBe(roomServiceData.icon);
    expect(allServices.services[0].color).toBe(roomServiceData.color);
    expect(allServices.services[0].temperature).toBe(roomServiceData.temperature);
    expect(allServices.services[0].name).toBe(roomServiceData.name);
  });

  test('Should create an empty AllServices', () => {
    const emptyAllServices = AllServices.createEmpty();
    expect(emptyAllServices.services.length).toBe(1);
    expect(emptyAllServices.services[0].icon).toBe('');
    expect(emptyAllServices.services[0].color).toBe('');
    expect(emptyAllServices.services[0].temperature).toBe(0);
    expect(emptyAllServices.services[0].name).toBe('');
  });

  test('Should calculate median temperature', () => {
    const additionalServiceData = {
      icon: 'test-icon-2',
      color: 'test-color-2',
      temperature: 35,
      name: 'test-service-2',
    };

    const finalTemperature = (25 + 35) / 2;

    allServices.services.push(new RoomService(additionalServiceData));

    const medianTemperature = AllServices.calculateMedianTemperature(allServices);

    expect(medianTemperature).toBe(finalTemperature);
  });

  test('Should update AllServices properties', () => {
    allServices.services[0].icon = 'new-icon';
    allServices.services[0].color = 'new-color';
    allServices.services[0].temperature = 30;
    allServices.services[0].name = 'new-service';

    expect(allServices.services[0].icon).toBe('new-icon');
    expect(allServices.services[0].color).toBe('new-color');
    expect(allServices.services[0].temperature).toBe(30);
    expect(allServices.services[0].name).toBe('new-service');
  });
});

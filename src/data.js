const vehicleEmissions = [
    { vehicle: 'Bicycle', emission: 0 },
    { vehicle: 'Motorcycle (Petrol)', emission: 120 },
    { vehicle: 'Car (Petrol)', emission: 180 },
    { vehicle: 'Train (Electric)', emission: 30 },
    { vehicle: 'Flight', emission: 150 },
  ];
  
  const averageSpeeds = [
    { vehicle: 'Bicycle', speed: 20 },
    { vehicle: 'Motorcycle (Petrol)', speed: 60 },
    { vehicle: 'Car (Petrol)', speed: 80 },
    { vehicle: 'Train (Electric)', speed: 100 },
    { vehicle: 'Flight', speed: 900 }, // Average speed for flights
];
  
  const practicalDistances = [
    { vehicle: 'Bicycle', maxDistance: 7 },
    { vehicle: 'Motorcycle (Petrol)', maxDistance: 10 },
    { vehicle: 'Car (Petrol)', maxDistance: 500 },
    { vehicle: 'Train (Electric)', maxDistance: 500 },
    { vehicle: 'Flight', maxDistance: 500000 },
  ];
  
  const trains = [
    {
      name: 'Express Train 1',
      origin: 'Chennai, Tamil Nadu, India',
      destination: 'Gujarat, India',
      startTime: '09:00',
      endTime: '12:00',
    },
    {
      name: 'Express Train 2',
      origin: 'City B',
      destination: 'City C',
      startTime: '13:30',
      endTime: '16:45',
    },
    {
      name: 'Local Train 1',
      origin: 'City C',
      destination: 'City D',
      startTime: '08:15',
      endTime: '10:30',
    },
    {
        name: 'Express Train 1',
        origin: 'Kochi, Kerala, India',
        destination: 'Chennai, Tamil Nadu,India',
        startTime: '04:00',
        endTime: '14:30',
      },
    // Add more train objects as needed
  ];
  
  export { vehicleEmissions, averageSpeeds, practicalDistances, trains };
  
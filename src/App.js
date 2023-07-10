import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Select,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { FaLocationArrow, FaTimes } from 'react-icons/fa';

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

import { vehicleEmissions, averageSpeeds, trains } from './data';

const center = { lat: 48.8584, lng: 2.2945 };

const practicalDistances = [
  { vehicle: 'Bicycle', maxDistance: 7 },
  { vehicle: 'Motorcycle (Petrol)', maxDistance: 10 },
  { vehicle: 'Car (Petrol)', maxDistance: 500 },
  { vehicle: 'Train (Electric)', maxDistance: 500 },
  { vehicle: 'Flight', maxDistance: 500000 }, // Maximum distance for flights
];

function formatDistance(distance) {
  if (distance >= 1000) {
    const km = distance / 1000;
    return `${km.toFixed(2)} km`;
  }
  return `${distance} meters`;
}

function formatDuration(duration) {
  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} days ${hours % 24} hours ${minutes} minutes`;
    }
    return `${hours} hours ${minutes} minutes`;
  }
}

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB4JnT3stxfjIyYFdvbRUhNUbmzBhO41O8',
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [vehicleTimes, setVehicleTimes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isRouteCalculated, setIsRouteCalculated] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableTrains, setAvailableTrains] = useState([]);
  const [vehicleWithLeastEmission, setVehicleWithLeastEmission] = useState('');

  const originRef = useRef();
  const destinationRef = useRef();

  if (!isLoaded) {
    return <SkeletonText />;
  }

  function handleVehicleChange(event) {
    const selectedVehicle = event.target.value;
    setSelectedVehicle(selectedVehicle);
    setShowAdditionalFields(false);

    const distanceInKm = distance / 1000;

    const practicalDistance = practicalDistances.find(
      (item) => item.vehicle === selectedVehicle
    )?.maxDistance;

    if (practicalDistance) {
      if (distanceInKm < practicalDistance) {
        setShowAdditionalFields(
          selectedVehicle === 'Bicycle' || selectedVehicle === 'Car (Petrol)'
        );
      } else {
        setShowAdditionalFields(
          selectedVehicle === 'Bicycle' ||
            selectedVehicle === 'Car (Petrol)' ||
            selectedVehicle === 'Train (Electric)' ||
            selectedVehicle === 'Flight'
        );
      }
    }

    const selectedSpeed = averageSpeeds.find(
      (item) => item.vehicle === selectedVehicle
    )?.speed;

    if (selectedSpeed) {
      const distanceInKm = distance / 1000;
      const estimatedTime = (distanceInKm / selectedSpeed) * 60; // Convert to minutes
      setDuration(formatDuration(estimatedTime));
    } else {
      setDuration('');
    }
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
    const newDistance = results.routes[0].legs[0].distance.value;
    setDistance(newDistance);
    setDuration(results.routes[0].legs[0].duration.value);
    setIsRouteCalculated(true);

    // Calculate estimated times for each vehicle
    const calculatedTimes = averageSpeeds.map((item) => {
      const vehicle = item.vehicle;
      const speed = item.speed;
      const distanceInKm = newDistance / 1000;
      const estimatedTime = (distanceInKm / speed) * 60; // Convert to minutes
      return { vehicle, time: estimatedTime };
    });

    setVehicleTimes(calculatedTimes);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    originRef.current.value = '';
    destinationRef.current.value = '';
    setVehicleTimes([]);
    setSelectedVehicle('');
    setIsRouteCalculated(false);
    setShowAdditionalFields(false);
    setStartTime('');
    setEndTime('');
    setAvailableTrains([]);
  }

  function search() {
    const startTimeParts = startTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinutes = parseInt(startTimeParts[1]);

    const endTimeParts = endTime.split(':');
    const endHour = parseInt(endTimeParts[0]);
    const endMinutes = parseInt(endTimeParts[1]);

    const availableTrains = trains.filter((train) => {
      const trainStartTimeParts = train.startTime.split(':');
      const trainStartHour = parseInt(trainStartTimeParts[0]);
      const trainStartMinutes = parseInt(trainStartTimeParts[1]);

      const trainEndTimeParts = train.endTime.split(':');
      const trainEndHour = parseInt(trainEndTimeParts[0]);
      const trainEndMinutes = parseInt(trainEndTimeParts[1]);

      const isStartTimeInRange =
        (trainStartHour < endHour && trainEndHour > startHour) ||
        (trainStartHour === endHour && trainStartMinutes <= endMinutes) ||
        (trainEndHour === startHour && trainEndMinutes >= startMinutes);

      return (
        train.origin === originRef.current.value &&
        train.destination === destinationRef.current.value &&
        isStartTimeInRange
      );
    });

    setAvailableTrains(availableTrains);
  }

  function getTimeTaken() {
    const selectedSpeed = averageSpeeds.find(
      (item) => item.vehicle === selectedVehicle
    )?.speed;
    if (selectedSpeed) {
      const distanceInKm = distance / 1000;
      const timeInMinutes = (distanceInKm / selectedSpeed) * 60;
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = Math.floor(timeInMinutes % 60);
      return `${hours} hours ${minutes} minutes`;
    }
    return '';
  }

  function getCarbonEmission() {
    const emissionPerKm = vehicleEmissions.find(
      (item) => item.vehicle === selectedVehicle
    )?.emission;
    if (emissionPerKm) {
      const carbonEmission = (distance / 1000) * emissionPerKm;
      return `${carbonEmission.toFixed(2)} gCO2`;
    }
    return '';
  }
  
  return (
    <Box>
      <Flex
        position="relative"
        alignItems="center"
        justifyContent="center"
        h="400px" // Adjust the height as needed
      >
        <Box w="80%" h="100%">
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => setMap(map)}
          >
            <Marker position={center} />
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        </Box>
      </Flex>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>
        </HStack>
        <HStack spacing={2} mt={4} justifyContent="space-between">
          <Select
            placeholder="Select Vehicle"
            value={selectedVehicle}
            onChange={handleVehicleChange}
            isDisabled={!isRouteCalculated}
          >
            {distance < 7000 ? (
              <>
                <option value="Bicycle">Bicycle</option>
                <option value="Motorcycle (Petrol)">Motorcycle</option>
                <option value="Car (Petrol)">Car</option>
                <option value="Walk">Walk</option>
              </>
            ) : (
              <>
                <option value="Bicycle">Bicycle</option>
                <option value="Motorcycle (Petrol)">Motorcycle</option>
                <option value="Car (Petrol)">Car</option>
                {distance >= 12000 && <option value="Train (Electric)">Train</option>}
                {distance >= 500000 && <option value="Flight">Flight</option>}
                <option value="Walk">Walk</option>
              </>
            )}
          </Select>
          <ButtonGroup>
            <Button
              colorScheme="pink"
              type="submit"
              onClick={calculateRoute}
              isDisabled={isRouteCalculated}
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="Clear Route"
              icon={<FaTimes />}
              onClick={clearRoute}
              isDisabled={!isRouteCalculated}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {formatDistance(distance)}</Text>
          <IconButton
            aria-label="Center Map"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center);
              map.setZoom(15);
            }}
          />
        </HStack>
        {showAdditionalFields && (
          <Box mt={4}>
            {selectedVehicle === 'Car (Petrol)' || selectedVehicle === 'Bicycle' ? (
              <>
                <Text fontWeight="bold">Time Taken:</Text>
                <Text>{getTimeTaken()}</Text>
              </>
            ) : (
              <>
                <Text fontWeight="bold">Start Time:</Text>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Text fontWeight="bold">End Time:</Text>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <Button mt={2} colorScheme="pink" onClick={search}>
                  Search
                </Button>
              </>
            )}
          </Box>
        )}
        {selectedVehicle !== '' && (
          <Box mt={4}>
           <Text fontWeight="bold">Carbon Emission:</Text>
<Text>{getCarbonEmission()}</Text>

          </Box>
        )}
        {availableTrains.length > 0 && (
          <Box mt={4}>
            <Text fontWeight="bold">Available Trains:</Text>
            <ul>
              {availableTrains.map((train) => (
                <li key={train.name}>{train.name}</li>
              ))}
            </ul>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;

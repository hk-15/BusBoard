import fetch from 'node-fetch';
import { config } from 'dotenv';
import promptSync from 'prompt-sync';

const prompt = promptSync();
config();

const api_key = process.env.api_key;

async function fetchRequest(url){
    const response = await fetch(url);
    return await response.json();
}

async function validatePostcode(postcode) {
    const url = `https://api.postcodes.io/postcodes/${postcode}/validate`;
    return (await fetchRequest(url)).result;
}

async function getLocationByPC(postcode){
    const url = `https://api.postcodes.io/postcodes/${postcode}`;
    return (await fetchRequest(url)).result;
}

async function getBusStopsByLocation(postCodeData){
    const url = `https://api.tfl.gov.uk/StopPoint/?lat=${postCodeData.latitude}&lon=${postCodeData.longitude}&stopTypes=NaptanPublicBusCoachTram`;
    return await fetchRequest(url);
}

async function getArrivalsDataByBusStopID(busStopId){
    const url = `https://api.tfl.gov.uk/StopPoint/${busStopId}/Arrivals?api_key=${api_key}`
    let busStopData = await fetchRequest(url);
    return busStopData.sort((a, b)=>a["timeToStation"]-b["timeToStation"]);
}

function printBusStopData(busStopData, noOfBuses){
    for (let i = 0; i < noOfBuses; i++) {
    console.log("Line Name: " + busStopData[i].lineName);
    console.log("Minutes to arrive at the Station: " + Math.round(busStopData[i].timeToStation/60));
    console.log("Destination: " + busStopData[i].destinationName);
    console.log("---------------------------------------------------------------------------------------------");
    }
}

async function journeyPlanner(startingPoint, destination) {
    let urlJP = `https://api.tfl.gov.uk/Journey/JourneyResults/${startingPoint}/to/${destination}`;
    const responseJourneyPlan = await fetchRequest(urlJP);
    let journeySteps = await responseJourneyPlan.journeys[0].legs[0].instruction.steps;
    for (let i = 0; i < journeySteps.length; i++) {
        console.log(`${i+1}: ${journeySteps[i].descriptionHeading} ${journeySteps[i].description}.`);
    }
    console.log(`Total travel time is ${await responseJourneyPlan.journeys[0].duration} minute(s).`);
    console.log("---------------------------------------------------------------------------------------------");
}

let input = prompt("Enter the post code : ");

while (!(await validatePostcode(input))){
    console.log(`Invalid post code. Please try again.`);
    input = prompt("Enter the post code : ");
}

const postCodeData = await getLocationByPC(input);
const listOfBusStops = await getBusStopsByLocation(postCodeData);
const noOfNearestStops = 2;

if (listOfBusStops.stopPoints.length===0){
    console.log(`Sorry, there are no bus stops nearby.`);
} else {
    for (let i=0; i<noOfNearestStops; i++){
        let busStopId = listOfBusStops.stopPoints[i].naptanId;
        let busStopName = listOfBusStops.stopPoints[i].commonName;
        let sortedbusStopData = await getArrivalsDataByBusStopID(busStopId);
        let noOfBuses = 5;
        if (sortedbusStopData.length === 0) {
            console.log('There are no buses coming at this stop ' + busStopName);
        } else {
            if (sortedbusStopData.length<noOfBuses)
                noOfBuses = sortedbusStopData.length;
            console.log("Departures from: " + busStopName);
            console.log("---------------------------------------------------------------------------------------------");
            printBusStopData(sortedbusStopData, noOfBuses);
        }
        console.log(`Directions to ${busStopName}:`)
        await journeyPlanner(input, busStopId);
    }
}     

// if (badCase) {
//     throw error or return or do some default;
// }
// do normal case here
// if (badCase2) {
//     throw error or return or do some default;
// }
// do normal case here

// const postcode = getPostcodeFromUser();
// const nearbyBusStops = getNearbyBusStops(postcode);
// const arrivalsData = getArrivalsData(nearbyBusStops);


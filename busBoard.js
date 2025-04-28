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

function printBusStopData(busStopData, busStopName, noOfBuses){
    console.log("Departures from: " + busStopName);
    console.log("---------------------------------------------------------------------------------------------");
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
    console.log(responseJourneyPlan);
}
const input = prompt("Enter the post code : ");

//let url = `https://api.postcodes.io/postcodes/${input}/validate`;
if (!(await validatePostcode(input))){
    console.log(`Invalid post code. Please try again.`);
}
else {
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
                printBusStopData(sortedbusStopData, busStopName, noOfBuses);
            }

                //await journeyPlanner(input, busStopId);
        }
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


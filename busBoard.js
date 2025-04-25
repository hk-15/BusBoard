import fetch from 'node-fetch';
import { config } from 'dotenv';
import promptSync from 'prompt-sync';
const prompt = promptSync();
config();

const api_key = process.env.api_key;

async function fetchRequest(url){
    const response = await fetch(url);
    const responseBody = await response.json();
    return responseBody;
}

function printBusStopData(busStopData, busStopName, noOfData){
    console.log("Departures from: " + busStopName);
    console.log("---------------------------------------------------------------------------------------------");
    for (let i = 0; i < noOfData; i++) {
        console.log("Line Name: " + busStopData[i].lineName);
        console.log("Minutes to arrive at the Station: " + Math.round(busStopData[i].timeToStation/60));
        console.log("Destination: " + busStopData[i].destinationName);
        console.log("---------------------------------------------------------------------------------------------");
    }
}
const input = prompt("Enter the post code : ");
let url = `https://api.postcodes.io/postcodes/${input}/validate`;
if ((await fetchRequest(url)).result===true){
    url = `https://api.postcodes.io/postcodes/${input}`;
    const postCodeData = await fetchRequest(url);
    const lat = postCodeData.result.latitude;
    const lon = postCodeData.result.longitude;

    url = `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram`;
    const nearestStops = await fetchRequest(url);
    if (nearestStops.stopPoints.length!=0){
        let busStopId = nearestStops.stopPoints[0].naptanId;
        let busStopName = nearestStops.stopPoints[0].commonName;

        url = `https://api.tfl.gov.uk/StopPoint/${busStopId}/Arrivals?api_key=${api_key}`
        let busStopData = await fetchRequest(url);
        let sortedbusStopData = busStopData.sort((a, b)=>a["timeToStation"]-b["timeToStation"]);

        const noOfBusStops = 5;
        if (sortedbusStopData.length!= 0) {
            printBusStopData(sortedbusStopData, busStopName, noOfBusStops);
        }
        else {
            console.log('There are no buses coming at this stop ' + busStopName);
        } 
        

        busStopId = nearestStops.stopPoints[1].naptanId;
        busStopName = nearestStops.stopPoints[1].commonName;

        busStopData = await fetchRequest(url);
        sortedbusStopData = busStopData.sort((a, b)=>a["timeToStation"]-b["timeToStation"]);
        if (busStopData.length!= 0) {
            printBusStopData(sortedbusStopData, busStopName, noOfBusStops);
        }
        else {
            console.log('There are no buses coming at this stop ' + busStopName);
        }
    }
    else {
        console.log(`Sorry, there are no bus stops nearby.`);
    }
}
else {
    console.log(`Invalid post code. Please try again.`);
}
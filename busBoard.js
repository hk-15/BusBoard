import fetch from 'node-fetch';
import { config } from 'dotenv';
import promptSync from 'prompt-sync';
const prompt = promptSync();

config();

const api_key = process.env.api_key;

async function getArrivalsFromTfl(stopPointId) {
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
    const responseBody = await response.json();

    let sortedResponse = responseBody.sort((a, b)=>a["timeToStation"]-b["timeToStation"]);
    
    return sortedResponse;
};

//console.log(await getArrivalsFromTfl('490008660N'));
const input = prompt("Enter the stop point Id : ");

let sortedList = await getArrivalsFromTfl(input);
for (let i = 0; i < 5; i++) {
    console.log("Line Name: " + sortedList[i].lineName);
    console.log("Minutes to arrive at the Station: " + Math.round(sortedList[i].timeToStation/60));
    console.log("Destination: " + sortedList[i].destinationName);
    console.log("---------------------------------------------------------------------------------------------");
}


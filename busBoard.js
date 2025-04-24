import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const api_key = process.env.api_key;

async function getArrivalsFromTfl(stopPointId) {
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointId}/Arrivals?api_key=${api_key}`);
    const responseBody = await response.json();

    let sortedResponse = responseBody.sort((a, b)=>a["timeToStation"]-b["timeToStation"]);

    return sortedResponse;
};

console.log(await getArrivalsFromTfl('490008660N'));

//await getArrivalsFromTfl('490008660N');


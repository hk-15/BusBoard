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

async function getPostCodeData(postCode) {
    const responsePostCode = await fetch(`https://api.postcodes.io/${postCode}`);
    const responsePostCodeBody = await responsePostCode.json();
    //console.log(responsePostCodeBody);
    return responsePostCodeBody;
};




const input = prompt("Enter the post code : ");
console.log(await getPostCodeData('490008660N'));

/*let sortedList = await getArrivalsFromTfl(input);
for (let i = 0; i < 5; i++) {
    console.log("Line Name: " + sortedList[i].lineName);
    console.log("Minutes to arrive at the Station: " + Math.round(sortedList[i].timeToStation/60));
    console.log("Destination: " + sortedList[i].destinationName);
    console.log("---------------------------------------------------------------------------------------------");
}*/


const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const { promisify } = require('util');

const delay = promisify(setTimeout);

let repeat = true;

console.log({ env: process.env });

const task = async () => {
    const response = await fetch('http://worldclockapi.com/api/json/utc/now');
    const json = await response.json();
    console.log({ response: json });
}

const loop = async () => {
    ['SIGHUP', 'SIGINT', 'SIGTERM']
        .forEach((signal) => {
            process.on(signal, () => {
                console.log(`process received a ${signal} signal`);

                repeat = false;
            });
        });

    while (repeat) {
        await task();
        await delay(process.env.INTERVAL || 5000);
    }
}

exports.loop = loop;
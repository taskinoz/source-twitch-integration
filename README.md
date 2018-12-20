<p align="center" style="text-align:center"><img width="130" height="150" src="http://titanfall.taskinoz.com/teaser.png" alt="Titanfall Twitch Integration" /></p>

# Titanfall Twitch Integration

Using Twitch chat and Icepick to dynamically change the gameplay in Titanfall 2

## Installation

- Download Icepick [here](https://titanfallmods.com)

- Download the latest release of Titanfall Twitch Integration from [here](#)

- Add your username, oath key and channel name to the ``twitch-login.example.json`` and rename it to ``twitch-login.json``

- Change the voting times in ``config.json``

- Patch Icepick with the dll ``\patch\TTF2SDK.dll`` (Thanks McSimp) and remove the mods from icepick in ``ICEPICKFOLDER\data\mods``

- Run ``TTI.exe``

## Development

- Clone the repository

- Run `npm install`

- Start the twitch integration `npm start`

<p align="center" style="text-align:center"><img width="130" height="150" src="http://titanfall.taskinoz.com/teaser.png" alt="Titanfall Twitch Integration" /></p>

# Titanfall Twitch Integration

Using Twitch chat and Icepick to dynamically change the gameplay in Titanfall 2

## Installation

- Download Icepick [here](https://titanfallmods.com)
- Download the latest release of Titanfall Twitch Integration from [here](#)
- Add your username, oath key and channel name to the ``twitch-login.example.json`` and rename it to ``twitch-login.json``. **Get your OATH key [here](https://twitchapps.com/tmi/)**
- Change the voting times in ``config.json`` if needed (Default is 30s for voting and 60s for playtime)
- Patch Icepick by moving the DLL from ``\patch\TTF2SDK.dll`` (Thanks McSimp) into the Icepick folder, replacing the `TTF2SDK.dll` that was already there
- Remove the mods from icepick in ``ICEPICKFOLDER\data\mods``
- Launch Titanfall 2 from the newly patched Icepick launcher
- Follow the **Setup** instructions and run ``TTI.exe``

## Setup

- To use the Graphics pack in OBS add a new `Browser` in the `Sources` menu and set the URL to `http://localhost/` or `http://localhost:80/`
- Set the Width and Heigh to the window size e.g width:1920 - height:1080
- Remove the CSS unless you want to change some of the styles and colors.
- Additionally you can check `Refresh browser when scene becomes active`

![OBS Screenshot](http://titanfall.taskinoz.com/OBS.png)

## Bugs & Issues

The mod isn't perfect and will crash when playing Beacon Chapter 2 just before getting the tool gun from the Marvin

If you are having issues showing the graphics in OBS:
- try disabling the Browser source and Re-enabling it
- click the `Refresh cache of current page` button in the Browser source properties
- make sure the local server is running. This [link](http://localhost/) will open it

## Development

- Clone the repository
- Run `npm install`
- Configure the twith-login.json (See Installation)
- Start the twitch integration `npm start`

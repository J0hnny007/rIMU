# rIMU
A reddit Inbox Management Utility for u/UpdateMeBot

## Background

I have a ton of subscribed items on UpdateMeBot, and I am a bit behind on some of my chapters deep inside my inbox.
So I've decided to try and dabble a bit with the Reddit API and build myself a tool to help me manage this giant list.
Learned quite a bit in the process and hope that it will be useful to peeps other than me.

## UI

<img src="/Users/j0hnny007/PycharmProjects/rIMU/media/example-screenshot.png" width="375" height="812" alt="example-image"/>

Example screenshot for mobile interface

## Features

- A nice (but currently unoptimized) responsive webui for accessibility on all devices with a browser
- Fetches Inbox updates (currently manually)
- Caches every message locally
- Shows a dynamic message ratio counter (unread/all/unread) that adjusts on set filters
- Search your subscribed items by title and or author
- Open chapters in reddit-web or (for those that still have) apollo on mobile
- Mark your messages read or unread

## Preparation

You need a Reddit API token to use this project.
Paste your username/password and API credentials into `auth.py.example` and remove the `.example`

## Installation

1. Install Docker
2. Navigate to the root directory of this repo
3. Start the application with `docker compose up`

## Usage

Open your browser and enter servers IP address, eg: `http://192.168.10.42:5000`

## Disclaimer

This code is neither optimized nor safe. Use at you own risk.

## Author

- J0hnny007

## License

This project is licensed under the MIT open source license.
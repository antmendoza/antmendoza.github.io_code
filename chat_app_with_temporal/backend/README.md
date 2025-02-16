# Backend for Chat Application using Temporal

## Description

This application leverages Temporal to manage users and chat messages as long-running workflows

It uses Temporal workflows to store user configurations and chat messages.
Workflows communicate with each other using Temporal's signals.

The application it is implemented as two workflows:


### User Configuration workflow
Every user is represented as a Temporal workflow and stores information such as contacts, chats, and notifications.


### Chat workflow
Another long-running workflow that stores chat messages between two or more users and notifies them of new messages.


## Install dependencies

```bash
npm install
```

## Running the app

### Start server / rest api

```bash
npm run start:server
```

### Start worker

```bash
npm run start:worker
```


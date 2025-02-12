# Backend for Chat Application using NestJS and Temporal

## Description

This project uses Temporal to store user configuration and chat messages.

It is implemented as two workflows:

### User Configuration workflow

Every user is represented as a Temporal workflow, and we can communicate with it through signals and updates to:
- add a new contact
- start a chat with another contact
- notify the user of new messages
it stores a reference of the contacts and chate with other users.


### Chat workflow
The chat workflow is a long-running workflow that stores the chat messages between two or more users. It is initiated
as a child workflow of the User Configuration workflow when the user start a chat with another user.

It stores the chat messages and notifies the users of new messages.


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


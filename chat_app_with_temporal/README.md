# Chat app with Temporal

This application leverages Temporal to manage users and chat messages as long-running workflows

![chat.gif](chat.gif)


[Learn here about the backend implementation](backend/README.md)

## How to run the chat app

### Start the Temporal server

```bash
cd temporal-server
./start-server.sh
```


### Start the frontend

```bash
cd frontend
./start-frontend.sh
```


### Start the backend
```bash
cd backend
./start-worker.sh
```

```bash
cd backend
./start-server.sh
```

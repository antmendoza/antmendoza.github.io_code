# Chat app with Temporal

This is a chat app that uses Temporal to manage users and the chat messages as long-running workflows.


![chat.gif](chat.gif)



[Read here to see how the backend is implemented with Temporal](backend/README.md)

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

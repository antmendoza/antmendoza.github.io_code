# To-do list with Temporal



![Screenshot 2025-01-10 at 18.23.12.png](files/Screenshot%202025-01-10%20at%2018.23.12.png)

---

![Screenshot 2025-01-10 at 18.23.32.png](files/Screenshot%202025-01-10%20at%2018.23.32.png)

---


## Running the project


### with docker compose

```bash
docker compose down --remove-orphans
docker compose up --build  --force-recreate  --no-deps

```



### run each component separately

``` bash 
cd temporal-server
./start-server.sh
```



``` bash 
cd backend
./start-backend.sh
```


``` bash 
cd frontend
./start-frontend.sh
```


``` bash 
cd backend
./start-backend.sh
```






# Todo List with Temporal

This is the backend for a Todo List application built using Temporal.

It implements a long-running workflow that manages the task list and provides the following functionality:
- Create, update, delete, and complete tasks.
- Schedule deadlines for each task.

Classes worth mentioning:
- [TodoController.java](src/main/java/com/antmendoza/temporal/presentation/rest/TodoController.java) is the REST controller that exposes the endpoints for the application.
- [WorkflowTodoListImpl.java](src/main/java/com/antmendoza/temporal/infrastructure/workflow/WorkflowTodoListImpl.java) is the implementation of the workflow that manages the list of Todos. 

    It interacts with [TodoService.java](src/main/java/com/antmendoza/temporal/application/service/TodoService.java) to create and update Tasks and Timers associated with each Task.

- [TodoService.java](src/main/java/com/antmendoza/temporal/application/service/TodoService.java) interacts with the repositories
  - [TodoRepository.java](src/main/java/com/antmendoza/temporal/infrastructure/persistence/TodoRepository.java) 
  - [TimerRepository.java](src/main/java/com/antmendoza/temporal/infrastructure/persistence/TimerRepository.java)

  to create and update Timers and Tasks respectively.
- [DateProvider.java](src/main/java/com/antmendoza/temporal/domain/service/DateProvider.java) is an interface that provides the current time. It is used to ensure the workflow remains deterministic during replay.


## Running the project

``` bash 
./start-backend.sh
```





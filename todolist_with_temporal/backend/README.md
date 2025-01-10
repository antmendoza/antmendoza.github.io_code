# TODO list implementation with Temporal

## TL;DR: 
> [Here](https://github.com/antmendoza/antmendoza.github.io_code/blob/main/todolist_with_temporal) is the code.

Temporal offers an API to build retriable and reliable applications. It ensures that 
your applications will be eventually executed even in presence of errors... but not only that. 
 
The API provide convenient methods to create timers or interact with your applications through messages (AKA signal and workflow update)
or create an entity workflow without having to worry about the db model and db interactions.

In this post we will create a TODO app, for that we will some of the Temporal primitives like signal, query, 
timer and workflow update. We will use Java, and we will take advance of the new feature `@WorkflowInit` that 
allows anotate workflow constructor. (see notes for https://github.com/temporalio/sdk-java/releases/tag/v1.26.0)

Let's describe todo list features: 
- add TODO 
- update TODO
- complete TODO
- list TODOs

where TODO has id, title , dueDate and status (ACTIVE, EXPIRED, COMPLETED)

Let's start with the Workflow Interface:

```
@WorkflowInterface
public interface WorkflowTodoList {

  @WorkflowMethod
  void run(TodoRepository todoRepository);

  @UpdateMethod
  void addTodo(final TodoRequest todoRequest);

  @QueryMethod
  List<Todo> getTodos();

  @UpdateMethod
  void updateTodo(TodoRequest todoRequest);
}
```


To help keeping our code organized, we will be using DDD for some aspects, 

- The workflow's main method `run` takes the TodoRepository as an input, it represent an inmemory 


Note that we don't use Instant.now() to calculate the current Date. This is because workflows can be replaying at 
any time and we want to keep our code deterministic. Read more about this her


We have to use Workflow.currentMillis and at the same time we don't want to pollute our TodoService with the Temporal API. 
Easy, use dependency injection. 


And here is where the magic happen. 

Cancellable scope so we can cancel the timer if 







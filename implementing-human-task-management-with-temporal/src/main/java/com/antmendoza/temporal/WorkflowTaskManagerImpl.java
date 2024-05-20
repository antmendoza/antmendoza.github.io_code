package com.antmendoza.temporal;

import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.util.List;
import java.util.Objects;

public class WorkflowTaskManagerImpl implements WorkflowTaskManager {
    private final Logger logger = Workflow.getLogger(WorkflowTaskManagerImpl.class.getName());


    private TasksList taskListService = new TasksList();


    @Override
    public void run(TasksList taskList) {

        this.taskListService = taskList != null ? taskList : new TasksList();


        while (true) {

            Workflow.await(
                    () ->
                            // Wait until there are pending task to process
                            this.taskListService.hasUnprocessedTasks());


            final Task task = this.taskListService.getNextUnprocessedTasks();
            logger.info("Processing task " + task);
            Task previousTask = task.getPreviousState();
            logger.info("Processing previousTask " + previousTask);


            if (previousTask != null &&
                    // Here we could add activities to notify the user...
                    !Objects.equals(task.getAssignedTo(), previousTask.getAssignedTo())) {
                //Notify use task.getAssignedTo()
            }

        }


    }

    @Override
    public void addTask(Task task) {
        taskListService.add(task);
    }

    @Override
    public void validateChangeTaskStateTo(ChangeTaskRequest changeTaskRequest) {

        final String taskId = changeTaskRequest.taskId();
        if (!taskListService.canTaskTransitionToState(changeTaskRequest)) {
            final TaskState taskState = taskListService.getTask(taskId).getTaskState();
            throw new RuntimeException("Task with id [" + taskId + "], " +
                    "with state [" + taskState + "], can not transition to " + changeTaskRequest.newState());
        }
    }


    @Override
    public void changeTaskStateTo(ChangeTaskRequest changeTaskRequest) {
        taskListService.changeTaskStateTo(changeTaskRequest);
    }

    @Override
    public List<Task> getAllTasks() {
        return taskListService.getTasks();
    }


}

package com.antmendoza.temporal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

public class TasksList {

    private final List<Task> tasks = new ArrayList<>();

    private final List<Task> unprocessedAddedTasks = new ArrayList<>();

    @JsonIgnore
    public void add(final Task task) {
        this.unprocessedAddedTasks.add(task);
        this.tasks.add(task);
    }

    @JsonIgnore
    public List<Task> getAll() {
        return this.tasks;
    }

    @JsonIgnore
    public boolean canTaskTransitionToState(final ChangeTaskRequest changeTaskRequest) {
        final TaskState taskState = getTask(changeTaskRequest.taskId()).getTaskState();


        boolean canTransition = false;
        final TaskState newState = changeTaskRequest.newState();
        switch (newState) {
            case Assigned:
                if (taskState.equals(TaskState.New) ||
                        taskState.equals(TaskState.Unclaimed) ||
                        taskState.equals(TaskState.Assigned)) {
                    canTransition = true;
                }
                break;

            case Unclaimed:
                if (taskState.equals(TaskState.New) ||
                        taskState.equals(TaskState.Assigned) ||
                        taskState.equals(TaskState.Unclaimed)) {
                    canTransition = true;
                }
                break;
            // TODO implement validation for other transitions
            default:
                throw new RuntimeException(taskState + " to "+newState+" not implemented");
        }

        return canTransition;

    }

    @JsonIgnore
    public Task getTask(final String taskId) {
        return this.tasks.stream().filter(t -> t.getId().equals(taskId)).findFirst().get();
    }

    @JsonIgnore
    public void changeTaskStateTo(final ChangeTaskRequest changeTaskRequest) {

        final String taskId = changeTaskRequest.taskId();
        final Task task = getTask(taskId);
        final TaskState taskState = task.getTaskState();
        if (!canTaskTransitionToState(changeTaskRequest)) {
            throw new RuntimeException("Task with id [" + taskId + "], " +
                    "with state [" + taskState + "], can not transition to " + changeTaskRequest.newState());
        }


        // For the sake of simplicity Task is mutable
        task.changeTaskState(changeTaskRequest);
        this.unprocessedAddedTasks.add(task);

    }

    @JsonIgnore
    public boolean hasUnprocessedTasks() {
        return !this.unprocessedAddedTasks.isEmpty();
    }

    @JsonIgnore
    public Task getNextUnprocessedTasks() {
        return unprocessedAddedTasks.remove(unprocessedAddedTasks.size() - 1);
    }

    public List<Task> getTasks() {
        return tasks;
    }

}

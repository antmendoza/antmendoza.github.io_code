package com.antmendoza.temporal.taskinteraction;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

public class TasksList {

    private final List<Task> tasks = new ArrayList<>();

    private final List<Task> unprocessedTask = new ArrayList<>();

    @JsonIgnore
    public void add(final Task task) {
        this.unprocessedTask.add(task);
        this.tasks.add(task);
    }

    @JsonIgnore
    public List<Task> getAll() {
        return this.tasks;
    }

    @JsonIgnore
    public boolean canTaskTransitionToState(final ChangeTaskRequest changeTaskRequest,
                                            final TaskState newState) {
        final TaskState taskState = getTask(changeTaskRequest.taskId()).getTaskState();


        boolean canTransition = false;
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
                // code block
        }

        return canTransition;

    }

    @JsonIgnore
    public Task getTask(final String taskId) {
        return this.tasks.stream().filter(t -> t.getId().equals(taskId)).findFirst().get();
    }

    @JsonIgnore
    public void changeTaskStateTo(final ChangeTaskRequest changeTaskRequest, final TaskState newState) {
        final String taskId = changeTaskRequest.taskId();
        final TaskState taskState = getTask(taskId).getTaskState();
        if (canTaskTransitionToState(changeTaskRequest, newState)) {
            throw new RuntimeException("Task with id [" + taskId + "], " +
                    "with state [" + taskState + "], can not transition to " + newState);
        }

        //TODO IMPLEMENT

    }

    @JsonIgnore
    public boolean hasUnprocessedTask() {
        return !this.unprocessedTask.isEmpty();
    }

    @JsonIgnore
    public Task getNextTaskToProcess() {
        return unprocessedTask.remove(unprocessedTask.size() - 1);
    }

    public List<Task> getTasks() {
        return tasks;
    }
}

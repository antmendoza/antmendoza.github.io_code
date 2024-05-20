package com.antmendoza.temporal;

public record ChangeTaskRequest(String taskId, String assignedTo, String candidate, TaskState newState) {

}

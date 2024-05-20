package com.antmendoza.temporal.taskinteraction;

public record ChangeTaskRequest(String taskId, String assignedTo, String candidate) {

}

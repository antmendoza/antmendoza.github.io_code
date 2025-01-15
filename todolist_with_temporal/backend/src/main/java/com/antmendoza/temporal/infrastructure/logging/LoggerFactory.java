package com.antmendoza.temporal.infrastructure.logging;


import org.slf4j.Logger;
import io.temporal.workflow.Workflow;

public interface LoggerFactory {
    static Logger getLogger(Class<?> clazz) {
        return Workflow.getLogger(clazz);
    }
}
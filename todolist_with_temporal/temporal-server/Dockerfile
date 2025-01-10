FROM alpine:latest
ARG TARFILE=temporal_cli_latest_linux_amd64.tar.gz
RUN wget 'https://temporal.download/cli/archive/latest?platform=linux&arch=amd64' -O $TARFILE
RUN tar xf $TARFILE
RUN rm $TARFILE
RUN mv temporal /usr/local/bin
EXPOSE 7233 8233 34897
CMD [ "temporal", "server", "start-dev",  "--dynamic-config-value" , "frontend.enableUpdateWorkflowExecution=true", "--dynamic-config-value","frontend.enableUpdateWorkflowExecutionAsyncAccepted=true", "--dynamic-config-value","frontend.enableExecuteMultiOperation=true","--ui-ip=0.0.0.0"]

FROM golang:alpine
ARG TARFILE=temporal_cli_latest_linux_amd64.tar.gz
RUN wget 'https://temporal.download/cli/archive/latest?platform=linux&arch=amd64' -O $TARFILE
RUN tar xf $TARFILE
RUN rm $TARFILE
RUN mv temporal /usr/local/bin
EXPOSE 7233 8233 34897
# EXPOSE 8233

RUN apk --no-cache add bash curl ca-certificates

RUN apk --no-cache add curl

RUN curl -sSL "https://github.com/fullstorydev/grpcurl/releases/download/v1.8.7/grpcurl_1.8.7_linux_x86_64.tar.gz" | tar -xz -C /usr/local/bin

CMD [ "temporal", "server", "start-dev", \
        "--dynamic-config-value" , "frontend.enableUpdateWorkflowExecution=true", \
        "--dynamic-config-value","frontend.enableUpdateWorkflowExecutionAsyncAccepted=true", \
        "--dynamic-config-value","frontend.enableExecuteMultiOperation=true",\
        "--ui-ip=0.0.0.0",\
        "--ip=0.0.0.0"]

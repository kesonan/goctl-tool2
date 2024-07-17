#!/bin/bash

# shell for mac
# build web

port=2000
npmFile=$(which npm)

if [ ! -f $npmFile ];then
  echo "npm not exists, installing..."
  echo "brew install node"
  brew install node
  if [ $? -ne 0 ];then
    echo "node install failed"
    exit $?
  fi
fi

echo 'npm run build'
cd web && npm run build

cd ..

if [ $? -eq 0 ];then
  echo "package build success"
else
  echo "package build failed"
fi

trap 'onCtrlC' INT

function onCtrlC() {
  echo "kill -9 $pid"
  kill -9 $pid
  exit 0
}

pid=$(lsof -nP | grep 'LISTEN'| grep $port | awk  '$1 == "main" {print $2}')
if [ -n "$pid" ];then
  echo "$port already on listening, pid is $pid, $pid will be killed"
  echo "kill -9 $pid"
  kill -9 $pid
fi

go mod tidy
echo "go run main.go"
nohup go run main.go > goctl-tool.log 2>&1 &

started=0
while [ true ]; do
  if [ $started -eq 0 ];then
    pid=$(lsof -nP | grep 'LISTEN'| grep $port | awk  '$1 == "main" {print $2}')
    if [ -n "$pid" ];then
      echo "serve on http://127.0.0.1:$port, pid: $pid, execute ctrl+c to kill process."
      open "http://127.0.0.1:$port"
      started=1
    fi
  fi
  sleep 1
done
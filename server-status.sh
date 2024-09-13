#!/bin/bash

# Search for the stackql process
stackql_process=$(ps -ef | grep '[s]tackql')

# Check if the process is running
if [ -z "$stackql_process" ]; then
  echo "Server is not running."
else
  # Extract the port and PID using awk/sed
  port=$(echo "$stackql_process" | sed -n 's/.*--pgsrv.port=\([0-9]*\).*/\1/p')
  pid=$(echo "$stackql_process" | awk '{print $2}')

  # Check if port extraction was successful
  if [ -z "$port" ]; then
    echo "Server is running but could not detect the port (PID $pid)"
  else
    echo "Server is running on port $port (PID $pid)"
  fi
fi

#!/bin/bash

# Find the process ID of the StackQL server
PID=$(pgrep -f "stackql")

if [ -z "$PID" ]; then
    echo "stackql server is not running."
else
    echo "stopping stackql server (PID: $PID)..."
    kill $PID
    echo "stackql server stopped."
fi
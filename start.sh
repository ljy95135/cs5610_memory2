#!/bin/bash

export PORT=5104

cd ~/www/memory2
./bin/memory2 stop || true
./bin/memory2 start


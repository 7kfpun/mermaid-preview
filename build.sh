#!/bin/bash

set -e

echo "Building client..."
yarn build:client

echo "Building server..."
yarn build:server

echo "Build completed successfully!"

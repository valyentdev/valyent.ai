#!/bin/sh
docker build --platform linux/amd64 . -t valyent/ai-adonisjs-template:latest
docker push valyent/ai-adonisjs-template:latest
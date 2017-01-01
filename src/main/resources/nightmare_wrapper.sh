#!/bin/bash

DEBUG=nightmare xvfb-run -a --server-args="-screen 0 1024x768x24" ./node $@



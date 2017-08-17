#!/bin/bash
rm ebdeploy.zip
zip -r -q ebdeploy.zip -r * .[^.]* -x *.git*
eb deploy — staged — verbose
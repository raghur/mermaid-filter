#! /bin/bash
TEST_OUT=test-output
mkdir -p $TEST_OUT
pushd $TEST_OUT
pandoc -t json ../test.md > test.json
cat test.json | node ../index.js > transformed.json
pandoc -f json transformed.json -t html > transformed.html
xdg-open transformed.html
popd

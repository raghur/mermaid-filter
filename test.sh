#! /bin/bash
TEST_OUT=test-output
mkdir -p $TEST_OUT
pandoc -t json test.md > $TEST_OUT/test.json
cat $TEST_OUT/test.json | node index.js > $TEST_OUT/transformed.json
pandoc -f json $TEST_OUT/transformed.json -t html > $TEST_OUT/transformed.html
xdg-open $TEST_OUT/transformed.html

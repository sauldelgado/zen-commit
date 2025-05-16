#!/usr/bin/env node

const React = require('react');
const { render } = require('ink');
const { CommitScreen } = require('../cli/screens');

// Use React.createElement instead of JSX for JavaScript file
render(React.createElement(CommitScreen));

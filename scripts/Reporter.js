const Base = require('mocha/lib/reporters/base.js');
const Utils = require('mocha/lib/utils.js');
const inherits = Utils.inherits;
const color = Base.color;

/* global mock_status */
function Reporter(runner) {
  Base.call(this, runner);

  var self = this
    , indents = 0
    , n = 0;

  function indent() {
    return Array(indents).join('  ');
  }

  function printRefraxStack() {
    const requests = mock_status();
    if (requests.length == 0) {
      return;
    }

    indents++;
    console.log();
    console.log(indent() + color('pending', '%s'), 'Refrax Requests Made');
    console.log();
    requests.forEach(function(req) {
      var check = req.mocked
        ? color('checkmark', ' ' + Base.symbols.ok)
        : color('fail', ' ' + Base.symbols.err);
      console.log(indent() + req.url + check);
    });
  }

  runner.on('start', function() {
    console.log();
  });

  runner.on('suite', function(suite) {
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });

  runner.on('suite end', function() {
    --indents;
    if (indents === 1) {
      console.log();
    }
  });

  runner.on('pending', function(test) {
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function(test) {
    var fmt;
    if (test.speed === 'fast') {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s');
      console.log(fmt, test.title);
    }
    else {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)');
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function(test) {
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
    printRefraxStack();
  });

  runner.on('end', self.epilogue.bind(self));
}

inherits(Reporter, Base);

module.exports = Reporter;

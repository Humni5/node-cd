var Netmask = require('netmask').Netmask

var config

function Bitbucket (conf) {
  config = conf
}

function create (conf) {
  return new Bitbucket(conf)
}

module.exports.create = create

Bitbucket.prototype.post = function (req, res) {
  var authorizedIps = config.security.authorizedIps
  var bitbucketIps = config.security.bitbucketIps
  var ipv4 = req.ip.replace('::ffff:', '')

  var authorizedIp = false

  // check bitbucket ip ranges
  bitbucketIps.forEach(function (value) {
    var block = new Netmask(value)
    if (block.contains(ipv4)) authorizedIp = true
  })

  if (!(authorizedIp || authorizedIps.indexOf(ipv4) >= 0)) {
    console.log('Unauthorized IP:', req.ip)
    res.writeHead(403)
    res.end()
    return
  }

  if (!req.body.push) {
    res.writeHead(204)
    res.end()
    return
  }

  var commits = req.body.push.changes
  if (commits.length <= 0) {
    res.writeHead(204)
    res.end()
    return
  }

  var commitsFromBranch = commits.filter(function (commit) {
    return commit.new.name === config.repository.branch ||
      commit.new.name === 'refs/heads/master' ||
      commit.new.name === 'refs/heads/develop'
  })

  if (commitsFromBranch.length > 0) {
    console.log('Executing bash file...')
    myExec(config.action.exec.bitbucket, req.body.repository.name)
  }

  res.writeHead(200)
  res.end()
}

var myExec = function (line, repo) {
  var exec = require('child_process').exec
  var execCallback = function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error)
    }

    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
    console.log('exec finished')
  }
  exec(line, repo, execCallback)
}

var Transform = require('readable-stream').Transform
var util = require('util')
var repeat = require('repeat-string')
var dullstring = require('dullstring')

module.exports = MarkdownBuilder

function maybeFormat (s) {
  if (s && s.type) {
    return format(s) || ''
  }
  return s
}

function format (chunk) {
  switch (chunk.type) {
    case 'header':
      return dullstring('\n:level :text\n')({
        level: repeat('#', chunk.level),
        text: chunk.text
      })
    case 'anchor':
      return dullstring('<a href=":name"></a>\n')(chunk)
    case 'link':
      return dullstring('[:target](:text)')(chunk)
    case 'text':
      return chunk.text
    case 'table.header':
      return '\n'
    case 'table.header-row':
      return '| ' +
        chunk.labels
          .map(maybeFormat)
          .join('| ') + '|\n' +
        repeat('|-----', chunk.labels.length) + '|\n'
    case 'table.row':
      return '| ' +
        chunk.values
          .map(maybeFormat)
          .join('| ') + '|\n'
    case 'table.footer':
      return '\n'
  }
}

function MarkdownBuilder () {
  Transform.call(this, {writableObjectMode: true})
}

util.inherits(MarkdownBuilder, Transform)

MarkdownBuilder.prototype._transform = function (chunk, enc, callback) {
  var text
  if ((text = format(chunk))) {
    this.push(text)
  }
  callback()
}

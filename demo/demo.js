"use strict";

window.asf = (function(){
  var _asf = anbtSqlFormatter;
  var doc = document;

  function _id(elem, id){ return elem.getElementById(id); }
  function _name(elem, name){ return elem.getElementsByName(name); }

  var StringUtil = {
    endsWith: function(str, pattern){
      var re = new RegExp(pattern+"$", "m");
      var matchResult = str.match(re);
      if( str.match(re) === null ){
        return false;
      }else{
        return true;
      }
    }
  };

  function hide(elem){
    elem.style.display = "none";
  }
  function show(elem){
    elem.style.display = "";
  }

  _asf.Formatter.prototype.formatHtml = function(sql){
    var self = this;
    var isSqlEndsWithNewLine = false;
    var list;

    if(StringUtil.endsWith(sql, "\n")){
      isSqlEndsWithNewLine = true;
    }

    var tokens = this.parser.parse(sql);

    var statements = this.splitToStatements(tokens);

    var statementsFormatted = 
        statements.map(function(statement){
          return self.formatList(statement);
        });

    var result = "";
    statementsFormatted.forEach(function(tokens, a){
      tokens.forEach(function(token){
        if( token.type != _asf.TokenConstants.SPACE ){
          result += "<span class='"+ token.type +"'>"
              + token.string
              + "</span>";
        }else{
          result += token.string;
        }
      });
      if( a < statementsFormatted.length-1 ){
        result += "\n;\n\n";
      }
    });

    result = result.replace(/\n\n$/, "");

    if( isSqlEndsWithNewLine ){
      result += "\n";
    }

    return result;
  };

  function format(){
    var rule = new _asf.Rule();
    rule.functionNames.push("DATE");
    rule.kw_minus1_indent_nl_kw_plus1_indent.push("LIMIT");
    var formatter = new _asf.Formatter(rule);

    _id(doc, "output").value
        = formatter.format( _id(doc, "input").value );
    _id(doc, "output_html").innerHTML
        = formatter.formatHtml( _id(doc, "input").value );
  }

  function init(){
    _id(doc, "input").addEventListener("input", format, false);

    // 初回表示時の処理
    format();

    _name(doc, "switch_output")[0].addEventListener("click", function(ev){
      var outputHtml = _id(doc, "output_html");
      var output = _id(doc, "output");

      var showElem;
      if(output.style.display === "none"){
        showElem = output;
      }else{
        showElem = outputHtml;
      }

      hide(outputHtml);
      hide(output);
      show(showElem);
    }, false);
  }

  return { init: init };
})();

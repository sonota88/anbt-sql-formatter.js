/**
anbt-sql-formatter.js

(C) 2014 sonota (yosiot8753@gmail.com)

SQL tokenizer and formatter library for JavaScript
ported from BlancoSqlFormatter
http://sourceforge.jp/projects/blancofw/releases/?package_id=4732
.

License: LGPL

Authors:

  sonota:: Porting to Javascript
  
  Following are Authors of BlancoSqlFormatter(original Java version).
  
  渡辺義則 / Yoshinori WATANABE / A-san:: Early development
  伊賀敏樹 (Tosiki Iga / いがぴょん):: Maintainance

See Also:

  Ruby port
  https://github.com/sonota/anbt-sql-formatter
*/

"use strict";

var anbtSqlFormatter;

(function(){

  // --------------------------------
  // Utils

  var ArrayUtil = {
    add: function(ary, i, val){
      ary.splice(i, 0, val);
    },
    get: function(ary, i){
      if(i < 0 || ary.length - 1 < i){
        throw "index out of bounds";
      }
      return ary[i];
    },
    remove: function(ary, i){
      ary.splice(i, 1);
    },
    include: function(ary, x){
      for(var a=0,len=ary.length; a<len; a++){
        if(ary[a] == x){
          return true;
        }
      }
      return false;
    },
    any: function(ary, func){
      return ary.some(func);
    }
  };

  var StringUtil = {
    charAt: function(str, index){
      if(index >= str.length){
        throw "invalid index: length(" + str.length + ")"
            + " arg(" + index + ")";
      }

      return str.charAt(index);
    },
    equalsIgnoreCase: function(str1, str2){
      if( str1.toUpperCase() === str2.toUpperCase() ) {
        return true;
      }else{
        return false;
      }
    },
    startsWith: function(str, pattern){
      return str.slice(0, str.length) === pattern;
    },
    endsWith: function(str, pattern){
      var matchResult = str.match(new RegExp(pattern+"$", "m"));
      return matchResult !== null;
    },

    takeAfter: function(str, index){
      return str.slice(index, str.length);
    }
  };

  // --------------------------------

  var AnbtSqlConstants = {
    SQL_RESERVED_WORDS: [
      // ANSI SQL89
      "ALL", "AND", "ANY", "AS", "ASC", "AUTHORIZATION", "AVG", "BEGIN",
      "BETWEEN", "BY", "CHAR", "CHARACTER", "CHECK", "CLOSE", "COBOL",
      "COMMIT", "CONTINUE", "COUNT", "CREATE", "CURRENT", "CURSOR",
      "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELETE", "DESC",
      "DISTINCT", "DOUBLE", "END", "ESCAPE", "EXEC", "EXISTS", "FETCH",
      "FLOAT", "FOR", "FOREIGN", "FORTRAN", "FOUND", "FROM", "GO",
      "GOTO", "GRANT", "GROUP", "HAVING", "IN", "INDICATOR", "INSERT",
      "INT", "INTEGER", "INTO", "IS", "KEY", "LANGUAGE", "LIKE", "MAX",
      "MIN", "MODULE", "NOT", "NULL", "NUMERIC", "OF", "ON", "OPEN",
      "OPTION", "OR", "ORDER", "PASCAL", "PLI", "PRECISION", "PRIMARY",
      "PRIVILEGES", "PROCEDURE", "PUBLIC", "REAL", "REFERENCES", "ROLLBACK",
      "SCHEMA", "SECTION", "SELECT", "SET", "SMALLINT", "SOME", "SQL",
      "SQLCODE", "SQLERROR", "SUM", "TABLE", "TO", "UNION", "UNIQUE",
      "UPDATE", "USER", "VALUES", "VIEW", "WHENEVER", "WHERE", "WITH", "WORK",
      // ANSI SQL92
      "ABSOLUTE", "ACTION", "ADD", "ALLOCATE", "ALTER", "ARE",
      "ASSERTION", "AT", "BIT", "BIT_LENGTH", "BOTH", "CASCADE",
      "CASCADED", "CASE", "CAST", "CATALOG", "CHAR_LENGTH",
      "CHARACTER_LENGTH", "COALESCE", "COLLATE", "COLLATION", "COLUMN",
      "CONNECT", "CONNECTION", "CONSTRAINT", "CONSTRAINTS", "CONVERT",
      "CORRESPONDING", "CROSS", "CURRENT_DATE", "CURRENT_TIME",
      "CURRENT_TIMESTAMP", "CURRENT_USER", "DATE", "DAY", "DEALLOATE",
      "DEFERRABLE", "DEFERRED", "DESCRIBE", "DESCRIPTOR", "DIAGNOSTICS",
      "DISCONNECT", "DOMAIN", "DROP", "ELSE", "END-EXEC", "EXCEPT",
      "EXCEPTION", "EXECUTE", "EXTERNAL", "EXTRACT", "FALSE", "FIRST",
      "FULL", "GET", "GLOBAL", "HOUR", "IDENTITY", "IMMEDIATE",
      "INITIALLY", "INNER", "INPUT", "INSENSITIVE", "INTERSECT",
      "INTERVAL", "ISOLATION", "JOIN", "LAST", "LEADING", "LEFT",
      "LEVEL", "LOCAL", "LOWER", "MATCH", "MINUTE", "MONTH", "NAMES",
      "NATIONAL", "NATURAL", "NCHAR", "NEXT", "NO", "NULLIF",
      "OCTET_LENGTH", "ONLY", "OUTER", "OUTPUT", "OVERLAPS", "PAD",
      "PARTIAL", "POSITION", "PREPARE", "PRESERVE", "PRIOR", "READ",
      "RELATIVE", "RESTRICT", "REVOKE", "RIGHT", "ROWS", "SCROLL",
      "SECOND", "SESSION", "SESSION_USER", "SIZE", "SPACE", "SQLSTATE",
      "SUBSTRING", "SYSTEM_USER", "TEMPORARY", "THEN", "TIME",
      "TIMESTAMP", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TRAILING",
      "TRANSACTION", "TRANSLATE", "TRANSLATION",
      "TRIM", "TRUE", "UNKNOWN", "UPPER", "USAGE", "USING",
      "VALUE", "VARCHAR", "VARYING", "WHEN", "WRITE", "YEAR", "ZONE",
      // ANSI SQL99
      "ADMIN", "AFTER", "AGGREGATE", "ALIAS", "ARRAY", "BEFORE",
      "BINARY", "BLOB", "BOOLEAN", "BREADTH", "CALL", "CLASS", "CLOB",
      "COMPLETION", "CONDITION", "CONSTRUCTOR", "CUBE", "CURRENT_PATH",
      "CURRENT_ROLE", "CYCLE", "DATA", "DEPTH", "DEREF", "DESTROY",
      "DESTRUCTOR", "DETERMINISTIC", "DICTIONARY", "DO", "DYNAMIC",
      "EACH", "ELSEIF", "EQUALS", "EVERY", "EXIT", "FREE", "FUNCTION",
      "GENERAL", "GROUPING", "HANDLER", "HOST", "IF", "IGNORE",
      "INITIALIZE", "INOUT", "ITERATE", "LARGE", "LATERAL", "LEAVE",
      "LESS", "LIMIT", "LIST", "LOCALTIME", "LOCALTIMESTAMP", "LOCATOR",
      "LONG", "LOOP", "MAP", "MODIFIES", "MODIFY", "NCLOB", "NEW",
      "NONE", "NUMBER", "OBJECT", "OFF", "OLD", "OPERATION",
      "ORDINALITY", "OUT", "PARAMETER", "PARAMETERS", "PATH", "POSTFIX",
      "PREFIX", "PREORDER", "RAW", "READS", "RECURSIVE", "REDO",
      // ANSI SQLではないのだが とても良く使われる構文
      "TRUNCATE"
    ]
  };

  var AnbtSqlTokenConstants = {
    SPACE     : "space"
    , SYMBOL    : "symbol"
    , KEYWORD   : "keyword"
    , NAME      : "name"
    , VALUE     : "value"
    , COMMENT   : "comment"
    , END_OF_SQL: "end_of_sql"
    , UNKNOWN   : "unknown"
    , STRING    : "string"
  };

  // --------------------------------

  function Stack(){
    this.array = [];
  }

  Stack.prototype.push = function(x){
    this.array.push(x);
  };
  Stack.prototype.pop = function(x){
    return this.array.pop(x);
  };
  Stack.prototype.include = function(x){
    return ArrayUtil.include(this.array, x);
  };

  // --------------------------------

  function CoarseTokenizer(){
    this.commentSingleStart = "--";
    this.commentMultiStart  = "\\/\\*";
    this.commentMultiEnd    = "\\*\\/";
    this.str = null;
    this.result = null;
    this.buf = null;
    this.mode = null;
  }
  CoarseTokenizer.prototype = {

    /**
     * <pre>
     * These are exclusive:
     * - double quote string
     * - single quote string
     * - single line comment
     * - multiple line comment
     *
     * ソース先頭から見ていって先に現れたものが優先される。
     *
     * result <= buf <= str
     * </pre>
     */
    tokenize: function(str){
      this.str = str.replace("\r\n", "\n");

      var out_of_quote_single   = true;
      var out_of_quote_double   = true;
      var out_of_comment_single = true;
      var out_of_comment_multi  = true;

      this.result = [];
      this.buf = "";
      this.mode = "plain";
      
      var length = null;

      while( this.str.length > 0 ){

        if( this.str.match( /^(")/ ) && out_of_quote_double
            && out_of_quote_single && out_of_comment_single && out_of_comment_multi
          )
        {
          // begin double quote

          length = RegExp.$1.length;
          this.shiftToken(length, "plain", "quote_double", "start");
          out_of_quote_double = false;
          
        }else if( this.str.match( /^(")/ ) && !(out_of_quote_double)
                  && out_of_quote_single && out_of_comment_single && out_of_comment_multi
                )
        {
          // end double quote
          
          length = RegExp.$1.length;
          if( this.str.match( /^("")/ )) // escaped double quote (not end of double quote)
          {
            this.shiftToBuf(2);
          }else{
            this.shiftToken(length, "quote_double", "plain", "end");
            out_of_quote_double = true;
          }

        }else if( this.str.match(/^(')/) && out_of_quote_single &&
                  out_of_quote_double && out_of_comment_single && out_of_comment_multi
                )
        {
          // begin single quote
          
          length = RegExp.$1.length;
          this.shiftToken(length, "plain", "quote_single", "start");
          out_of_quote_single = false;
        }else if ( this.str.match(/^(')/) && !(out_of_quote_single) &&
                   out_of_quote_double && out_of_comment_single && out_of_comment_multi
                 )
        {
          // end single quote
          length = RegExp.$1.length;
          if( this.str.match(/^('')/ ) ){ // escaped single quote
            this.shiftToBuf(2);
          }else{
            this.shiftToken(length, "quote_single", "plain", "end");
            out_of_quote_single = true;
          }
          
        }else if( this.str.match( new RegExp( "^(" + this.commentSingleStart + ")") ) && (out_of_comment_single)
                  && out_of_quote_single && out_of_quote_double && out_of_comment_multi
                )
        {
          // begin single line comment
          
          length = RegExp.$1.length;
          this.shiftToken(length, "plain", "comment_single", "start");
          out_of_comment_single = false;

        }else if( this.str.match(/^(\n)/ ) && !(out_of_comment_single) &&
                  out_of_quote_single && out_of_quote_double && out_of_comment_multi
                )
        {
          // end single line comment
          
          length = RegExp.$1.length;
          this.shiftToken(length, "comment_single", "plain", "end");
          out_of_comment_single = true;

        }else if( this.str.match(new RegExp("^("+this.commentMultiStart+")")) &&
                  //}else if( this.str.match( /^\/\*/ ) &&
                  out_of_quote_single && out_of_quote_double && out_of_comment_single && out_of_comment_multi
                )
        {
          // begin multi line comment

          length = RegExp.$1.length;
          this.shiftToken(length, "plain", "comment_multi", "start");
          out_of_comment_multi = false;
          
        }else if( this.str.match(new RegExp("^("+this.commentMultiEnd+")")) &&
                  //}else if( this.str.match(/^\*\//) &&
                  out_of_quote_single && out_of_quote_double && out_of_comment_single && !(out_of_comment_multi)
                ){
          // end multi line comment
          
          length = RegExp.$1.length;
          this.shiftToken(length, "comment_multi", "plain", "end");
          out_of_comment_multi = true;
          
        }else if( this.str.match(/^\\/) ){
          // escape char
          this.shiftToBuf(2);

        }else{
          this.shiftToBuf(1);
        }
      }
      
      if( (this.buf+this.str).length > 0 ){
        this.result.push(
          { type: this.mode
            , string: this.buf + this.str
          }
        );
      }
      return this.result;
    },

    shiftToBuf: function(n){
      this.buf += this.str.slice(0, n);
      this.str = this.str.slice(n, this.str.length);
    },

    shiftToken: function(length, type, mode, flag){
      switch(flag){
      case "start":
        if( this.buf.length > 0 ){
          this.result.push( { type: type
                              , string: this.buf }
                          );
        }
        this.buf = this.str.slice(0, length); // <length> chars from head
        break;
      case "end":
        if( this.buf.length > 0 ){
          this.result.push( { type: type
                              , string: this.buf + this.str.slice(0, length) }
                          );
        }
        this.buf = "";
        break;
      default:
        throw "must not happen";
        break;
      }
      
      this.str = this.str.slice(length, this.str.length); // delete first <length> chars
      this.mode = mode;
    }
  };

  // --------------------------------

  function AnbtSqlToken(type, string, pos){
    this.type = type;
    this.string = string;
    if( pos >= 0 ){
      this.pos = pos;
    }else{
      this.pos = -1;
    }
  };
  AnbtSqlToken.prototype = {
    inspect: function(){
      return "" + this.type + " (" + this.string + ")";
    }
  };

  // --------------------------------

  var AnbtSqlRuleConstants = {
    KEYWORD_NONE: "keyword_none"
    , KEYWORD_UPPER_CASE: "keyword_upper_case"
    , KEYWORD_LOWER_CASE: "keyword_lower_case"
  };

  /**
   * nl: new line
   */
  function AnbtSqlRule(){
    // キーワードの変換規則.
    this.keywordCase = AnbtSqlRuleConstants.KEYWORD_UPPER_CASE; // default setting

    // インデントの文字列. 設定は自由入力とする。
    // 通常は " ", " ", "\t" のいずれか。
    this.indentString = "    ";

    this.spaceAfterCommma = false;
    this.additionalKeywords = [];

    //__foo
    //____KW
    this.kw_plus1_indent_kw_nl = [
      "INSERT"
      , "INTO"
      , "CREATE"
      , "DROP"
      , "TRUNCATE"
      , "TABLE"
      , "CASE"
    ];

    // ____foo
    // __KW
    // ____bar    
    this.kw_minus1_indent_nl_kw_plus1_indent = [
      "FROM", "WHERE",
      "SET", "HAVING",
      "ORDER BY", "GROUP BY"
    ];
    
    // __foo
    // ____KW    
    this.kw_nl_kw_plus1_indent = ["ON", "USING"];

    // __foo
    // __KW
    this.kw_nl_kw = ["OR", "WHEN", "ELSE"];

    this.kw_multi_words = ["ORDER BY", "GROUP BY"];

    // 関数の名前。
    // Java版は初期値 null
    this.functionNames = [
      // getNumericFunctions
      "ABS", "ACOS", "ASIN", "ATAN", "ATAN2", "BIT_COUNT", "CEILING",
      "COS", "COT", "DEGREES", "EXP",
      "FLOOR",
      "LOG", "LOG10",
      "MAX", "MIN",
      "MOD",
      "PI",
      "POW", "POWER",
      "RADIANS",
      "RAND",
      "ROUND",
      "SIN",
      "SQRT",
      "TAN",
      "TRUNCATE",
      // getStringFunctions
      "ASCII", "BIN", "BIT_LENGTH", "CHAR", "CHARACTER_LENGTH",
      "CHAR_LENGTH", "CONCAT", "CONCAT_WS", "CONV", "ELT",
      "EXPORT_SET", "FIELD", "FIND_IN_SET", "HEX,INSERT", "INSTR",
      "LCASE", "LEFT", "LENGTH", "LOAD_FILE", "LOCATE", "LOCATE",
      "LOWER", "LPAD", "LTRIM", "MAKE_SET", "MATCH", "MID", "OCT",
      "OCTET_LENGTH", "ORD", "POSITION", "QUOTE", "REPEAT",
      "REPLACE", "REVERSE", "RIGHT", "RPAD", "RTRIM", "SOUNDEX",
      "SPACE", "STRCMP", "SUBSTRING",
      "SUBSTRING", "SUBSTRING", "SUBSTRING", "SUBSTRING_INDEX",
      "TRIM",
      "UCASE",
      "UPPER",
      // getSystemFunctions
      "DATABASE", "USER",
      "SYSTEM_USER",
      "SESSION_USER",
      "PASSWORD",
      "ENCRYPT",
      "LAST_INSERT_ID",
      "VERSION",
      // getTimeDateFunctions
      "DAYOFWEEK", "WEEKDAY", "DAYOFMONTH", "DAYOFYEAR", "MONTH",
      "DAYNAME", "MONTHNAME", "QUARTER", "WEEK", "YEAR", "HOUR",
      "MINUTE", "SECOND", "PERIOD_ADD", "PERIOD_DIFF", "TO_DAYS",
      "FROM_DAYS", "DATE_FORMAT", "TIME_FORMAT", "CURDATE",
      "CURRENT_DATE", "CURTIME", "CURRENT_TIME", "NOW", "SYSDATE",
      "CURRENT_TIMESTAMP", "UNIX_TIMESTAMP", "FROM_UNIXTIME",
      "SEC_TO_TIME", "TIME_TO_SEC"
    ];
  }

  AnbtSqlRule.prototype = {
    isFunction: function(name) {
      if(this.functionNames == null){
        return false;
      }

      for( var a=0, len=this.functionNames.length; a<len; a++ ){
        if(StringUtil.equalsIgnoreCase(this.functionNames[a], name)){
          return true;
        }
      }
      return false;
    }
  };

  // --------------------------------

  function AnbtSqlParser (rule) {
    this.rule = rule;

    /** 解析前の文字列 */
    this.before = null;

    /** 解析中の位置 */
    this.pos = null;

    /** 解析中の文字 */
    this.char = null;

    this.tokenPos = null;

    // 2文字からなる記号。
    this.twoCharacterSymbol = [ "<>", "<=", ">=", "||", "!=" ];
  }
  AnbtSqlParser.prototype = {
    /**
     * 2005.07.26:: Tosiki Iga \r も処理範囲に含める必要があります。
     * 2005.08.12:: Tosiki Iga 65535(もとは-1)はホワイトスペースとして扱うよう変更します。
     */
    isSpace: function(c){
      return (
               c === " "
            || c === "\t"
            || c === "\n"
            || c === "\r"
            || c === 65535
      );
    },

    /**
     * 文字として認識して妥当かどうかを判定します。
     * 全角文字なども文字として認識を許容するものと判断します。
     */
    isLetter: function(c){
      if( this.isSpace(c) ){ return false; }
      if( this.isDigit(c) ){ return false; }
      if( this.isSymbol(c) ){ return false; }
      
      return true;
    },

    isDigit: function(c){
      return ( "0" <= c && c <= "9" );
    },

    /**
     * "#" は文字列の一部とします
     * アンダースコアは記号とは扱いません
     * これ以降の文字の扱いは保留
     */
    isSymbol: function(c){
      return (
               c === '"'
            || c === "?"
            || c === "%"
            || c === "&"
            || c === "'"
            || c === "("
            || c === ")"
            || c === "|"
            || c === "*"
            || c === "+"
            || c === ","
            || c === "-"
            || c === "."
            || c === "/"
            || c === ":"
            || c === ";"
            || c === "<"
            || c === "="
            || c === ">"
            || c === "!"
      );
    },

    beginWithFloatOrScientificNumber: function(str){
      if(str.match(/^(\d+(\.\d+(e-?\d+)?)?)/)){
        return {
          isMatched: true
          , matched: RegExp.$1
        };
      }else{
        return {
          isMatched: false
        };
      }
    },

    beginWithHexNumber: function(str){
      if(str.match(/^(0x[0-9a-fA-F]+)/)){
        return {
          isMatched: true
          , matched: RegExp.$1
        };
      }else{
        return {
          isMatched: false
        };
      }
    },

    /**
     * <pre>
     * トークンを次に進めます。
     * 1. posを進める。
     * 2. sに結果を返す。
     * 3. typeにその種類を設定する。
     * 不正なSQLの場合、例外が発生します。
     * ここでは、文法チェックは行っていない点に注目してください。
     * </pre>
     */
    getNextSqlToken: function(){

      var startPos = this.pos;

      if(this.pos >= this.before.length){
        this.pos++;
        return null;
      }

      this.char = StringUtil.charAt(this.before, this.pos);

      if( this.isSpace(this.char) ){
        var workString = "";
        var count = -1;
        while(true){
          count++;
          workString += this.char;
          
          // 次の文字が空白以外だったら
          if(this.pos + 1 < this.before.length){
            this.char = StringUtil.charAt(this.before, this.pos + 1 );
          }else{
            this.char = null;
          }
          if( !( this.isSpace(this.char) ) ){
            this.pos++;
            return new AnbtSqlToken(AnbtSqlTokenConstants.SPACE,
                                    workString, startPos);
          }

          this.pos++;

          if( this.pos >= this.before.length){
            return new AnbtSqlToken(AnbtSqlTokenConstants.SPACE,
                                    workString, startPos);
          }
        }
        
      }else if(this.char === ";"){
        this.pos += 1;
        // 2005.07.26 Tosiki Iga セミコロンは終了扱いではないようにする。
        return new AnbtSqlToken(AnbtSqlTokenConstants.SYMBOL,
                                ";", startPos);

      }else if(this.isDigit(this.char)){
        var retFloatOrScientificNumber = this.beginWithFloatOrScientificNumber(
          StringUtil.takeAfter(this.before, this.pos));
        var retHexNumber = this.beginWithHexNumber(
          StringUtil.takeAfter(this.before, this.pos));
        var num;
        if(retHexNumber.isMatched){
          num = retHexNumber.matched;
        }else if(retFloatOrScientificNumber.isMatched){
          num = retFloatOrScientificNumber.matched;
        }else{
          num = null;
        }
        if(num !== null){
          this.pos += num.length;
          return new AnbtSqlToken(AnbtSqlTokenConstants.VALUE,
                                  num, startPos);
        }else{
          throw "must not happen";
        }

      }else if( this.isLetter(this.char) ){
        var s = "";
        // 文字列中のドットについては、文字列と一体として考える。
        while ( this.isLetter(this.char) || this.isDigit(this.char) || this.char === '.') {
          s += this.char;
          this.pos += 1;
          if( this.pos >= this.before.length ){
            break;
          }

          this.char = StringUtil.charAt(this.before, this.pos);
        }

        for (var i = 0,len=AnbtSqlConstants.SQL_RESERVED_WORDS.length; i < len ; i++){
          if (StringUtil.equalsIgnoreCase(s, AnbtSqlConstants.SQL_RESERVED_WORDS[i])){
            return new AnbtSqlToken(AnbtSqlTokenConstants.KEYWORD,
                                    s, startPos);
          }
        }
        
        return new AnbtSqlToken(AnbtSqlTokenConstants.NAME,
                                s, startPos);

      }else if( this.isSymbol(this.char)){
        var s = "" + this.char;
        this.pos += 1;
        if (this.pos >= this.before.length) {
          return new AnbtSqlToken(AnbtSqlTokenConstants.SYMBOL,
                                  s, startPos);
        }
        // ２文字の記号かどうか調べる
        var ch2 = StringUtil.charAt(this.before, this.pos);
        for (var i = 0,len=this.twoCharacterSymbol.length; i<len ; i++) {
          if( (StringUtil.charAt(this.twoCharacterSymbol[i], 0) === this.char &&
               StringUtil.charAt(this.twoCharacterSymbol[i], 1) === ch2)
            ){
            this.pos += 1;
            s += ch2;
            break;
          }
        }

        var ret = this.beginWithFloatOrScientificNumber(
          StringUtil.takeAfter(this.before, this.pos));
        if( this.char === "-" && ret.isMatched ){
          this.pos += ret.matched.length;
          return new AnbtSqlToken(AnbtSqlTokenConstants.VALUE,
                                  s + ret.matched, startPos);
        }

        return new AnbtSqlToken(AnbtSqlTokenConstants.SYMBOL,
                                s, startPos);

      }else{
        this.pos++;
        return new AnbtSqlToken( AnbtSqlTokenConstants.UNKNOWN,
                                 "" + this.char,
                                 startPos );
      }
    },

    prepareTokens: function(sql){
      this.tokens = [];
      var coarseTokens = new CoarseTokenizer().tokenize(sql);
      var coarseToken;
      var pos = 0;

      while(pos < coarseTokens.length){
        coarseToken = coarseTokens[pos];
        
        switch(coarseToken.type){
        case "quote_single":
          this.tokens.push( new AnbtSqlToken(AnbtSqlTokenConstants.VALUE, coarseToken.string) );
          break;

        case "quote_double":
          this.tokens.push( new AnbtSqlToken(AnbtSqlTokenConstants.NAME, coarseToken.string) );
          break;

        case "comment_single":
          this.tokens.push( new AnbtSqlToken(AnbtSqlTokenConstants.COMMENT, coarseToken.string.replace(/\n$/m, "")) );
          break;

        case "comment_multi":
          this.tokens.push( new AnbtSqlToken(AnbtSqlTokenConstants.COMMENT, coarseToken.string) );
          break;

        case "plain":
          this.before = coarseToken.string;
          this.pos = 0;
          var count = 0;
          var token;
          while(true){
            token = this.getNextSqlToken();

            if(token == null){ break; }

            this.tokens.push(token);
            count++;
          }
          break;
        }
        pos++;
      }

      this.tokens.push(new AnbtSqlToken(AnbtSqlTokenConstants.END_OF_SQL, ""));
    },

    /**
     * <pre>
     * ２つ以上並んだキーワードは１つのキーワードとみなします。
     * ["a", " ", "group", " ", "by", " ", "b"]
     * => ["a", " ", "group by", " ", "b"]
     * </pre>
     */
    concatMultiwordsKeyword: function(tokens){
      var tempKwList = this.rule.kw_multi_words
          .map( function(x){ return x.split(" "); } );

      // ワード数が多い順から
      tempKwList.sort(
        function(a,b){
          return b.length - a.length;
        }).forEach(
          function(kw){
            
            var index = 0;
            var targetTokensSize = kw.length * 2 - 1;
            var tempTokens;
            
            while( index <= tokens.length - targetTokensSize ){
              
              tempTokens = tokens.slice(index, index + targetTokensSize)
                  .map(function(x){
                    return x.string.replace(/\s+/, " ");
                  });
              
              if( tempTokens.join("").toUpperCase()
                  === kw.join(" ") 
                )
              {
                tokens[index].string = tempTokens.join("");
                for(var c=targetTokensSize-1; c>=1; c--){
                  ArrayUtil.remove(tokens, index + c);
                }
              }
              
              index += 1;
            }
          });
      return tokens;
    },

    getNextToken: function(){
      return this.tokens[this.tokenPos];
    },

    /**
     * SQL文字列をトークンの配列に変換し返します。
     *
     * @param sqlStr 変換前のSQL文
     */
    parse: function(sqlStr){
      this.prepareTokens(sqlStr);
      
      var list = [];
      this.tokenPos = 0;

      var token;
      while(true){
        token = this.getNextToken();

        if( token.type === AnbtSqlTokenConstants.END_OF_SQL ){
          break;
        }

        list.push(token);
        this.tokenPos++;
      }

      list = this.concatMultiwordsKeyword(list);
      
      return list;
    }
  };


  // --------------------------------


  function AnbtSqlFormatter(rule){
    this.rule = rule;
    this.parser = new AnbtSqlParser(rule);
    
    // 丸カッコが関数のものかどうかを記憶
    this.functionBracket = new Stack();
  }
  AnbtSqlFormatter.prototype = {
    splitToStatements: function(tokens){
      var statements = [];
      var buf = [];
      for(var a=0,len=tokens.length; a<len; a++){
        var token = tokens[a];
        if( token.string === ";"){
          statements.push(buf);
          buf = [];
        }else{
          buf.push(token);
        }
      };

      statements.push(buf);

      return statements;
    },

    /**
     * 与えられたSQLを整形した文字列を返します。
     *
     * 改行で終了するSQL文は、整形後も改行付きであるようにします。
     *
     * @param sqlStr 整形前のSQL文
     */
    format: function(sqlStr){
      var isSqlEndsWithNewLine = false;
      var tokens;
      
      if(StringUtil.endsWith(sqlStr, "\n")){
        isSqlEndsWithNewLine = true;
      }
      
      tokens = this.parser.parse(sqlStr);

      var statements = this.splitToStatements(tokens);

      //tokens = this.formatList(tokens);
      var statementsFormatted = [];
      for(var a=0,len=statements.length; a<len; a++){
        statementsFormatted.push( this.formatList(statements[a]) );
      }
      
      var result = "";
      for(var b=0,len2=statementsFormatted.length; b<len2; b++){
        for(var c=0,len3=statementsFormatted[b].length; c<len3; c++){
          result += statementsFormatted[b][c].string;
        }
        if( b < statementsFormatted.length-1 ){
          result += "\n;\n\n";
        }
      }
      result = result.replace(/\n\n$/, "");
      
      if(isSqlEndsWithNewLine){
        result += "\n";
      }
      
      return result;
    },

    modifyKeywordCase: function(tokens){
      for(var a=0,len=tokens.length; a<len; a++){
        var token = tokens[a];

        if(token.type !== AnbtSqlTokenConstants.KEYWORD){
          continue;
        }

        switch(this.rule.keywordCase){
        case AnbtSqlRuleConstants.KEYWORD_NONE:
          break;
        case AnbtSqlRuleConstants.KEYWORD_UPPER_CASE:
          token.string = token.string.toUpperCase();
          break;
        case AnbtSqlRuleConstants.KEYWORD_LOWER_CASE:
          token.string = token.string.toLowerCase();
          break;
        }
      }
    },

    /**
     * <pre>
     * Oracle対応 begin 2007/10/24 A.Watanabe
     * Oracleの外部結合演算子"(+)"を１つの演算子とする。
     * ["(", "+", ")"] => ["(+)"]
     * </pre>
     */
    concatOperatorForOracle: function(tokens){

      var index = 0;
      // Length of tokens changes in loop!
      while(index < tokens.length - 2){
        if (tokens[index + 0].string === "(" &&
            tokens[index + 1].string === "+" &&
            tokens[index + 2].string === ")"){
          tokens[index + 0].string = "(+)";
          ArrayUtil.remove(tokens, index + 1);
          ArrayUtil.remove(tokens, index + 1);
        }
        index += 1;
      }
    },

    removeSymbolSideSpace: function(tokens){
      var prevToken = null;
      var token;
      for (var index = tokens.length - 1; index >= 1; index--) {
        token     = ArrayUtil.get(tokens, index);
        prevToken = ArrayUtil.get(tokens, index - 1);

        if (token.type === AnbtSqlTokenConstants.SPACE &&
            (prevToken.type === AnbtSqlTokenConstants.SYMBOL ||
             prevToken.type === AnbtSqlTokenConstants.COMMENT))
        {
          ArrayUtil.remove(tokens, index);
        }else if( (token.type === AnbtSqlTokenConstants.SYMBOL ||
                   token.type === AnbtSqlTokenConstants.COMMENT) &&
                  prevToken.type === AnbtSqlTokenConstants.SPACE)
        {
          ArrayUtil.remove(tokens, index - 1);
        }else if( token.type === AnbtSqlTokenConstants.SPACE ){
          token.string = " ";
        }
      }
    },

    insertSpaceBetweenTokens: function(list){
      var index = 1;

      // Length of tokens changes in loop!
      while( index < list.length){
        var prev  = ArrayUtil.get(list, index - 1);
        var token = ArrayUtil.get(list, index    );
        
        if (prev.type  != AnbtSqlTokenConstants.SPACE &&
            token.type != AnbtSqlTokenConstants.SPACE) {
          // カンマの後にはスペース入れない
          if( ! this.rule.space_after_comma){
            if( prev.string === ","){
              index += 1 ; continue;
            }
          }
          
          // 関数名の後ろにはスペースは入れない
          // no space after function name
          if ( this.rule.isFunction(prev.string) &&
               token.string === "(") {
            index += 1 ; continue;
          }
          
          ArrayUtil.add(list, index,
                        new AnbtSqlToken(AnbtSqlTokenConstants.SPACE, " ")
                       );
        }
        index += 1;
      }
    },

    formatListMainLoop: function(tokens){
      
      var indent = 0;
      // 丸カッコのインデント位置
      var bracketIndent = new Stack();

      var prev = new AnbtSqlToken( AnbtSqlTokenConstants.SPACE,
                                   " ");
      var token;
      var encounterBetween;
      
      var index = 0;
      while( index < tokens.length ){
        token = ArrayUtil.get(tokens, index);

        if( token.type === AnbtSqlTokenConstants.SYMBOL ){
          // indentを１つ増やし、'('のあとで改行。
          if( token.string === "(" ){
            this.functionBracket.push( this.rule.isFunction(prev.string) ? true : false );
            bracketIndent.push(indent);
            indent += 1;
            index += this.insertReturnAndIndent( tokens, index + 1, indent);

            // indentを１つ増やし、')'の前と後ろで改行。
          }else if( token.string === ")" ){
            indent = bracketIndent.pop();
            index += this.insertReturnAndIndent( tokens, index, indent);
            this.functionBracket.pop();
            
            // ','の前で改行
          }else if( token.string === "," ){
            index += this.insertReturnAndIndent( tokens, index, indent, "x");

          }else if( token.string === ";" ){
            // 2005.07.26 Tosiki Iga とりあえずセミコロンでSQL文がつぶれないように改良
            indent = 0;
            index += this.insertReturnAndIndent( tokens, index, indent);
          }
          
        }else if( token.type === AnbtSqlTokenConstants.KEYWORD ){
          // indentを２つ増やし、キーワードの後ろで改行
          if( StringUtil.equalsIgnoreCase(token.string, "DELETE") ||
              StringUtil.equalsIgnoreCase(token.string, "SELECT") ||
              StringUtil.equalsIgnoreCase(token.string, "UPDATE")   )
          {
            indent += 2;
            index += this.insertReturnAndIndent( tokens, index + 1, indent, "+2");
          }

          // indentを１つ増やし、キーワードの後ろで改行
          if (
            ArrayUtil.any(
              this.rule.kw_plus1_indent_kw_nl, function(kw){
                return StringUtil.equalsIgnoreCase(token.string, kw);
              })){
            indent += 1;
            index += this.insertReturnAndIndent( tokens, index + 1, indent );
          }

          // キーワードの前でindentを１つ減らして改行、キーワードの後ろでindentを戻して改行。
          if(
            ArrayUtil.any(
              this.rule.kw_minus1_indent_nl_kw_plus1_indent, function(kw){
                return StringUtil.equalsIgnoreCase(token.string, kw);
              })){
            index += this.insertReturnAndIndent(tokens, index    , indent - 1);
            index += this.insertReturnAndIndent(tokens, index + 1, indent    );
          }

          // キーワードの前でindentを１つ減らして改行、キーワードの後ろでindentを戻して改行。
          if (StringUtil.equalsIgnoreCase(token.string, "VALUES")){
            indent -= 1;
            index += this.insertReturnAndIndent(tokens, index, indent);
          }

          // キーワードの前でindentを１つ減らして改行
          if (StringUtil.equalsIgnoreCase(token.string, "END")){
            indent -= 1;
            index += this.insertReturnAndIndent( tokens, index, indent);
          }

          // キーワードの前で改行
          if(
            ArrayUtil.any(
              this.rule.kw_nl_kw, function(kw){
                return StringUtil.equalsIgnoreCase(token.string, kw);
              })){
            index += this.insertReturnAndIndent( tokens, index, indent);
          }
          
          // キーワードの前で改行, インデント+1
          if(
            ArrayUtil.any(
              this.rule.kw_nl_kw_plus1_indent, function(kw){
                return StringUtil.equalsIgnoreCase(token.string, kw);
              })){
            index += this.insertReturnAndIndent(tokens, index, indent + 1);
          }

          // キーワードの前で改行。indentを強制的に０にする。
          if(
            ArrayUtil.any(
              ["UNION", "INTERSECT", "EXCEPT"], function(kw){
                return StringUtil.equalsIgnoreCase(token.string, kw);
              })){
            indent -= 2;
            index += this.insertReturnAndIndent( tokens, index    , indent );
            index += this.insertReturnAndIndent( tokens, index + 1, indent );
          }
          
          if( StringUtil.equalsIgnoreCase(token.string, "BETWEEN") ){
            encounterBetween = true;
          }

          if( StringUtil.equalsIgnoreCase(token.string, "AND") ){
            // BETWEEN のあとのANDは改行しない。
            if( ! encounterBetween ){
              index += this.insertReturnAndIndent( tokens, index, indent );
            }
            encounterBetween = false;
          }

        }else if( token.type === AnbtSqlTokenConstants.COMMENT ){
          if(StringUtil.startsWith(token.string, "/*")){
            // マルチラインコメントの後に改行を入れる。
            index += this.insertReturnAndIndent( tokens, index + 1, indent);

          }else if( token.string.match(/^--/) ){
            // 1行コメント末尾の改行を削る。
            // トーカナイズ時に削った方が良いかも
            //token.string.chomp!
            
            index += this.insertReturnAndIndent( tokens, index + 1, indent);
          }
        }else{
          ;
        }

        prev = token;
        index++;
      }
    },

    /**
     * <pre>
     * 丸カッコで囲まれた (ひとつの項目)については特別扱いを行う。
     * @author tosiki iga
     *
     * before: ["(", space, "X", space, ")"]
     * after:  ["(", "X", ")"]
     *
     * ただし、これでは "(X)" という一つの symbol トークンになってしまう。
     * 整形だけが目的ならそれでも良いが、
     * せっかくなので symbol/X/symbol と分けたい。
     * </pre>
     */
    specialTreatmentForParenthesisWithOneElement: function(tokens){
      
      for(var index=tokens.length-1; index >= 4; index--){
        if (index >= tokens.length){
          continue;
        }

        var t0 = ArrayUtil.get(tokens, index    );
        var t1 = ArrayUtil.get(tokens, index - 1);
        var t2 = ArrayUtil.get(tokens, index - 2);
        var t3 = ArrayUtil.get(tokens, index - 3);
        var t4 = ArrayUtil.get(tokens, index - 4);

        if (
              StringUtil.equalsIgnoreCase(t4.string       , "(") &&
              StringUtil.equalsIgnoreCase(t3.string.trim(), "" ) &&
              StringUtil.equalsIgnoreCase(t1.string.trim(), "" ) && 
              StringUtil.equalsIgnoreCase(t0.string       , ")")
        ) {
          tokens[index - 4].string = t4.string + t2.string + t0.string;
          ArrayUtil.remove(tokens, index    );
          ArrayUtil.remove(tokens, index - 1);
          ArrayUtil.remove(tokens, index - 2);
          ArrayUtil.remove(tokens, index - 3);
        }
      }
    },
    
    formatList: function(tokens){
      if(tokens.length === 0){ return []; }

      var token;

      // SQLの前後に空白があったら削除する。
      // Delete space token at first and last of SQL tokens.

      token = ArrayUtil.get(tokens, 0);
      if( token.type === AnbtSqlTokenConstants.SPACE ){
        ArrayUtil.remove(tokens, 0);
      }
      if(tokens.length === 0){ return []; }

      token = ArrayUtil.get(tokens, tokens.length - 1);
      if(token.type === AnbtSqlTokenConstants.SPACE){
        ArrayUtil.remove(tokens, tokens.length - 1);
      }
      if(tokens.length === 0){ return []; }

      this.modifyKeywordCase(tokens);
      this.removeSymbolSideSpace(tokens);
      this.concatOperatorForOracle(tokens);

      var encounterBetween = false;

      this.formatListMainLoop(tokens);

      this.specialTreatmentForParenthesisWithOneElement(tokens);
      this.insertSpaceBetweenTokens(tokens);
      
      return tokens;
    },
    
    /**
     * index の箇所のトークンの前に挿入します。
     *
     * @return 
     *     空白を置き換えた場合 0,
     *     空白を挿入した場合 1
     */
    insertReturnAndIndent: function(tokens, index, indent, opt){
      
      // 関数内では改行は挿入しない
      // No linefeed in function.
      if( this.functionBracket.include(true) ){
        return 0;
      }

      try{
        // 挿入する文字列を作成する。
        var s = "\n";
        var token;

        // もし１つ前にシングルラインコメントがあるなら、改行は不要。
        var prevToken = ArrayUtil.get(tokens, index - 1);

        // Java版と異なる
        if( indent < 0 ){
          indent = 0;
        }
        for(var a=0; a<indent; a++){
          s += this.rule.indentString;
        }

        // 前後にすでにスペースがあれば、それを置き換える。
        token = ArrayUtil.get(tokens, index);
        if( token.type === AnbtSqlTokenConstants.SPACE ){
          token.string = s;
          return 0;
        }
        
        token = ArrayUtil.get(tokens, index - 1);
        if( token.type === AnbtSqlTokenConstants.SPACE ){
          token.string = s;
          return 0;
        }

        // 前後になければ、新たにスペースを追加する。
        ArrayUtil.add(tokens, index,
                      new AnbtSqlToken( AnbtSqlTokenConstants.SPACE, s )
                     );
        
        return 1;
      }catch(e){
        return 0;
      }
    }
  };

  anbtSqlFormatter = {
    TokenConstants: AnbtSqlTokenConstants
    ,RuleConstants: AnbtSqlRuleConstants
    ,Rule: AnbtSqlRule
    ,CoarseTokenizer: CoarseTokenizer
    ,Parser: AnbtSqlParser
    ,Formatter: AnbtSqlFormatter
  };

})();

if( typeof exports !== "undefined" ){
  exports.anbtSqlFormatter = anbtSqlFormatter;
}

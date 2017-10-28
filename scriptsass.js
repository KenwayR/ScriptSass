/*
ScriptSass - A Javascript SCSS compiler

Copyright (C) 2017  Sagnik Modak

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
	

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Contact Me:

Phone: +919774817655
E-mail: sagnikmodak1118@gmail.com

*/

function splitWithTail(str,delim,count){
  var parts = str.split(delim);
  var tail = parts.slice(count).join(delim);
  var result = parts.slice(0,count);
  result.push(tail);
  return result;
}

function findFirstPositive(b, a, i, c) {
  c=(d,e)=>e>=d?(a=d+(e-d)/2,0<b(a)&&(a==d||0>=b(a-1))?a:0>=b(a)?c(a+1,e):c(d,a-1)):-1
  for (i = 1; 0 >= b(i);) i *= 2
  return c(i / 2, i)|0
}

var ScriptSass = new Object();
ScriptSass.inString = function(i,arr){
					var j;
					var inString = 2;
					for(j=0;j<i;j++){
						if(arr[j].indexOf("\"") > -1)
							inString++;
					}
					return (inString%2 == 0)?true:false;
	};
ScriptSass.findClosure = function(arr,i){
					var j;
					var go = 0;
					for(j=i+1;j<arr.length;j++){
						if(arr[j] == "{")
							go++;
						if(arr[j] == "}" && go > 0)
							go--;
						if(arr[j] == "}" && go == 0)
							break;
					}
					return j;
	};
	
ScriptSass.isProperty = function(v){
							var pattern = new RegExp("^[^\$:].+$");
							if(pattern.test(v) && v.indexOf(":") > -1){
								return true;
							}
							return false;
	};

ScriptSass.replaceVars = function(str,vars,flag = 0){
						var i;
						var parts = str.split(/([:\s])+/g);
						for(i=0;i<parts.length;i++){
							if(parts[i].startsWith("$") && vars.hasOwnProperty(parts[i]))
								parts[i] = vars[parts[i]].data;
						}
						if(flag)
							return ScriptSass.evaluateFunctions(parts.join(""),vars);
						else
							return parts.join("");
};
	
ScriptSass.evaluateFunctions = function(str,vars){
								//function for maps
								if(str.indexOf("map-get") != -1)
									str = ScriptSass.mapGet(str,vars);
								return str;
};
ScriptSass.mapGet = function(str,vars){
								var i,arg,map_name,key;
								var parts = str.split(/(^|\s+)map\-get/g);
								for(i=0;i<parts.length;i++){
									if(parts[i].trim().startsWith("(") && parts[i].trim().endsWith(")")){
										arg = parts[i].substring(1,parts[i].length - 1).trim().split(",");
										map_name = arg[0].trim();
										key = arg[1].trim();
										if(map_name.startsWith("$") && vars.hasOwnProperty(map_name)){
											if(vars[map_name].type == "map"){
												parts[i] = vars[map_name].data[key];
											}
										}
									}
								}
								return parts.join("");
};
ScriptSass.replacePlaceholder = function(name,parentstr){
							if(name.indexOf("&") > -1){
								parentstr = parentstr.trim();
								var pstr = parentstr.split(" ");
								var p = pstr.pop();
								pstr = pstr.join(" ")+" ";
								return (pstr+name.replace(/[&]/g, p)).trim();
							}else
								return (parentstr+name).trim();
};

ScriptSass.evaluateExpression = function(exp,base_fs=16){
									var i,n;
									var nums = exp.match(/(\d+\.?\d*\s?)(px|em|vh|vw|%|cm|mm|in|pt|pc|rem|vmax|vmin)/g);
									var width = $(window).width();
									var height = $(window).height();
									var dpi = findFirstPositive(x => matchMedia(`(max-resolution: ${x}dpi)`).matches);
									if(nums != null){
										for(i=0;i<nums.length;i++){
											if(nums[i].endsWith("%")){
												n = nums[i].substring(0,nums[i].indexOf("%")).trim();
												exp = exp.replace(nums[i],(n*width/100));
											}else if(nums[i].endsWith("px")){
												exp = exp.replace(nums[i],nums[i].substring(0,nums[i].indexOf("px")).trim());
											}else if(nums[i].endsWith("vw")){
												n = nums[i].substring(0,nums[i].indexOf("vw")).trim();
												exp = exp.replace(nums[i],n*width/100);
											}else if(nums[i].endsWith("vh")){
												n = nums[i].substring(0,nums[i].indexOf("vh")).trim();
												exp = exp.replace(nums[i],n*height/100);
											}else if(nums[i].endsWith("em")){
												n = nums[i].substring(0,nums[i].indexOf("em")).trim();
												exp = exp.replace(nums[i],n*base_fs);
											}else if(nums[i].endsWith("vmax")){
												n = nums[i].substring(0,nums[i].indexOf("vmax")).trim();
												exp = exp.replace(nums[i],n*Math.max(width,height));
											}else if(nums[i].endsWith("vmin")){
												n = nums[i].substring(0,nums[i].indexOf("vmin")).trim();
												exp = exp.replace(nums[i],n*Math.min(width,height));
											}else if(nums[i].endsWith("pt")){
												n = nums[i].substring(0,nums[i].indexOf("pt")).trim();
												exp = exp.replace(nums[i],n*dpi/72);
											}else if(nums[i].endsWith("pc")){
												n = nums[i].substring(0,nums[i].indexOf("pc")).trim();
												exp = exp.replace(nums[i],n*dpi/6);
											}else if(nums[i].endsWith("rem")){
												n = nums[i].substring(0,nums[i].indexOf("rem")).trim();
												exp = exp.replace(nums[i],n*16);
											}else if(nums[i].endsWith("in")){
												n = nums[i].substring(0,nums[i].indexOf("in")).trim();
												exp = exp.replace(nums[i],n*dpi);
											}else if(nums[i].endsWith("cm")){
												n = nums[i].substring(0,nums[i].indexOf("cm")).trim();
												exp = exp.replace(nums[i],n*dpi*0.3937007874);
											}else if(nums[i].endsWith("mm")){
												n = nums[i].substring(0,nums[i].indexOf("mm")).trim();
												exp = exp.replace(nums[i],n*dpi*0.03937007874);
											}
										}
									}
									var expression = exp.match(/(^#{0})(\d*\.?\d*\s?\+?\-?\/?\*?\(?\)?)+/g);
									if(expression == null){
										return exp;
									}else{
										expression = expression.filter(function(v,i){return (v.trim()=="")?false:true});
										for(i=0;i<expression.length;i++){
											exp = exp.replace(expression[i],eval(expression[i])+"px ");
										}
									}
									return exp;
};

ScriptSass.tokenize = function(rawcode,parentstr=""){
		var par = parentstr;
		var imp = [];
		var code = rawcode.replace(/[^\x20-\x7E]/gmi, "").split('"').map(function(v,i){
				if(i%2){
					return v;
					//do nothing;
				}else{
					var parts = v.split(/([{};])/g);
					for(i = 0; i < parts.length; i++){
					parts[i] = parts[i].trim();
					if(!parts[i].startsWith("@")){
						var colindex = parts[i].indexOf(":");
						if(colindex > -1){
							parts[i] = parts[i].substring(0,colindex+1) + parts[i].substring(colindex+1,parts[i].length).trim();
						}else{
							parts[i] = parts[i].replace(/\s/g, "");
						}
					}
					}
					v = parts.join('');
				}
					return v;
			}).join('"');
		var tokens = code.split(/([{};])/g);
		tokens = tokens.map(function (v,i,arr){
			if(v.startsWith("@")){
				if(v.startsWith("@import")){
					var url = splitWithTail(v," ",1)[1].replace(/^"(.*)"$/, '$1');
					arr.splice(i,1);
					i--;
					imp = imp.concat(ScriptSass.importSCSS(url));
					return "";
				}
				if(v.startsWith("@extend")){
					var selector = splitWithTail(v," ",1)[1].replace(/^"(.*)"$/, '$1');
					return {type:"extend",data:selector};
				}
				if(v.startsWith("@mixin")){
					var func_def = splitWithTail(v," ",1)[1];
					var func_name = func_def.substring(0,func_def.indexOf("("));
					var func_var_list = func_def.substring(func_def.indexOf("(")+1,func_def.indexOf(")")).split(",");
					for(k=0;k<func_var_list.length;k++)
						func_var_list[k] = func_var_list[k].trim();
					var func_body = arr.slice(i+2,ScriptSass.findClosure(arr,i)).join('');
					var closure = ScriptSass.findClosure(arr,i+1) - i;
					arr.splice(i+1,closure);
					return {type:"mixin",data:{name:func_name,params:func_var_list,data:ScriptSass.tokenize(func_body,par)}};
				}
				if(v.startsWith("@include")){
					var inc_def = splitWithTail(v," ",1)[1];
					var inc_name = inc_def.substring(0,inc_def.indexOf("("));
					var inc_params = inc_def.substring(inc_def.indexOf("(")+1,inc_def.indexOf(")")).split(",");
					for(k=0;k<inc_params.length;k++)
						inc_params[k] = inc_params[k].trim();
					return {type:"include",name:inc_name,params:inc_params};
				}
			}
			if(ScriptSass.isProperty(v) && (arr[i+1] == ";" || i == arr.length-1)){
				var prop_def = splitWithTail(v,":",1);
				var prop_name = prop_def[0];
				var prop_data = prop_def[1];
				return {type:"property",data:{name:prop_name,data:prop_data}};
			}
			if(arr[i+1] == "{"){
				var sel_name = v;
				var sel_body = arr.slice(i+2,ScriptSass.findClosure(arr,i)).join('');
				var closure = ScriptSass.findClosure(arr,i+1) - i;
				arr.splice(i+1,closure);
				var pstr = par+sel_name+" ";
				return {type:"selector",data:{name:sel_name,data:ScriptSass.tokenize(sel_body,pstr)},parent_string:par};
			}
			if(v.startsWith("$")){
					var var_def = splitWithTail(v,":",1);
					var var_name = var_def[0];
					var var_data = var_def[1];
					var var_type;
					if(!isNaN(var_data)){
						var_type = "number";
					}else{
						if(var_data.startsWith("(") && var_data.endsWith(")"))
							var_type = "map";
						else
							var_type = "expression";
					}
					if(var_type == "map"){
						var_data.replace(/[\(\)]/g,"");
						var pairs = var_data.split(",");
						var map = [];
						var pair,key,val;
						for(k=0;k<pairs.length;k++){
							pair = pairs[k].split(":");
							key = pair[0].replace(/[\)\(\s]/g,"");
							val = pair[1].replace(/[\)\)\s]/g,"");
							map[key] = val;
						}
						var_data = map;
					}
					return {type:"variable",data:{name:var_name,type:var_type,data:var_data}};
			}
			return v;
		}).filter(function (v){
			return (typeof v == "object");
		});
		return imp.concat(tokens);
};
ScriptSass.lexer = function (tk,sel_list = [],flag = 0,varlist = {},mixlist = {}){
	var i;
	var vars = varlist;
	var mixins = mixlist;
	var imports = [];
	var data = [];
		for(i=0;i<tk.length;i++){
			if(typeof tk[i] == "object"){
				if(tk[i].type == "variable"){
					vars[tk[i].data.name] = {type:tk[i].data.type,data:tk[i].data.data};
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "mixin"){
					mixins[tk[i].data.name] = {params:tk[i].data.params,data:tk[i].data.data};
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "selector"){
					var sel = tk[i];
					tk.splice(i,1);
					i--;
					sel.data.data = ScriptSass.lexer(sel.data.data,sel_list,1);
					sel_list.push({"name":ScriptSass.replacePlaceholder(sel.data.name,sel.parent_string),data:sel.data.data});
					continue;
				}
				if(tk[i].type == "property"){
					data.push(tk[i]);
					tk.splice(i,1);
					i--;
					continue;
				}
				if(tk[i].type == "include"){
					data.push(tk[i]);
					tk.splice(i,1);
					i--;
					continue;
				}
			}
		}
	if(flag)	
		return {variables:vars,mixes:mixins,imports:imports,props:data};
	else
		return {variables:vars,mixes:mixins,imports:imports,selectors:sel_list};
};
ScriptSass.parse = function(ast){
				var i,j,k;
				//variable and include replacements
				if(ast.hasOwnProperty('selectors')){
					for(i=0;i<ast.selectors.length;i++){
						ast.selectors[i].name = ScriptSass.replaceVars(ast.selectors[i].name,ast.variables);
						for(j=0;j<ast.selectors[i].data.props.length;j++){
							if(ast.selectors[i].data.props[j].type == "property"){
								ast.selectors[i].data.props[j].data.name = ScriptSass.replaceVars(ast.selectors[i].data.props[j].data.name,ast.variables);
								for(var attr in ast.variables){
									if(!ast.selectors[i].data.variables.hasOwnProperty(attr))
										ast.selectors[i].data.variables[attr]=ast.variables[attr];
								}
								ast.selectors[i].data.props[j].data.data = ScriptSass.replaceVars(ast.selectors[i].data.props[j].data.data,ast.selectors[i].data.variables,1);
							}else if(ast.selectors[i].data.props[j].type == "include"){
								var params = ast.selectors[i].data.props[j].params;
								var fname = ast.selectors[i].data.props[j].name;
								ast.selectors[i].data.props.splice(j,1);
								j--;
								for(var attr in ast.mixes){
									if(!ast.selectors[i].data.mixes.hasOwnProperty(attr))
										ast.selectors[i].data.mixes[attr]=ast.mixes[attr];
								}
								var vlist={};
								for(k=0;k<ast.selectors[i].data.mixes[fname].params.length;k++){
									vlist[ast.selectors[i].data.mixes[fname].params[k]] = {type:"expression",data:params[k]};
								}
								var props = ScriptSass.parse(ScriptSass.lexer(ast.selectors[i].data.mixes[fname].data,[],1,vlist,ast.selectors[i].data.mixes)).props;
								ast.selectors[i].data.props = ast.selectors[i].data.props.concat(props);
							}
						}
					}
				}else if(ast.hasOwnProperty('props')){
					for(j=0;j<ast.props.length;j++){
							if(ast.props[j].type == "property"){
								ast.props[j].data.name = ScriptSass.replaceVars(ast.props[j].data.name,ast.variables);
								ast.props[j].data.data = ScriptSass.replaceVars(ast.props[j].data.data,ast.variables,1);
							}else if(ast.props[j].type == "include"){
								var params = ast.props[j].params;
								var fname = ast.props[j].name;
								ast.props.splice(j,1);
								j--;
								var vlist={};
								for(k=0;k<ast.mixes[fname].params.length;k++){
									vlist[ast.mixes[fname].params[k]] = {type:"expression",data:params[k]};
								}
								var props = ScriptSass.parse(ScriptSass.lexer(ast.selectors[i].data.mixes[fname].data,[],1,vlist,ast.mixes)).props;
								ast.props = ast.props.concat(props);
							}
						}
				}
				return ast;
};
ScriptSass.compileInternal = function(ast,base_fs = 16){
					var i;
					var css="";
					if(ast.hasOwnProperty('selectors')){
						for(i=0;i<ast.selectors.length;i++){
							css+=ast.selectors[i].name+"{"+ScriptSass.compileInternal(ast.selectors[i].data)+"}";
						}
					}else if(ast.hasOwnProperty('props')){
						for(i=0;i<ast.props.length;i++){
							if(ast.props[i].type == "property")
								css+=ast.props[i].data.name+":"+ScriptSass.evaluateExpression(ast.props[i].data.data, base_fs)+";";
						}
					}
					return css;
};
ScriptSass.compile = function(code){
					return ScriptSass.compileInternal(ScriptSass.parse(ScriptSass.lexer(ScriptSass.tokenize(code))));
};
ScriptSass.compileInline = function(inlineUnrestricted = false){
		var dfd = $.Deferred();
		var ast;
		var mixins = [];
		var vars = [];
		$('code[type="sass"]').each(function (){
			$(this).hide();
			code = $(this).html();
			ast = ScriptSass.lexer(ScriptSass.tokenize(code));
			for(v in ast.mixes){mixins[v] = ast.mixes[v]};
			for(v in ast.variables){vars[v] = ast.variables[v]};
			($('head').find('style').length > 0) ? $('head style').append(ScriptSass.compile(code)):$('head').append('<style>'+ScriptSass.compile(code)+'</style>');
		});
		if(inlineUnrestricted){
			$('[style]').each(function (){
				code = ScriptSass.compileInternal(ScriptSass.parse(ScriptSass.lexer(ScriptSass.tokenize($(this).attr('style')),[],1,vars,mixins)));
				$(this).attr('style',code);
			});
		}else{
			$('.scss[style]').each(function (){
				code = ScriptSass.compileInternal(ScriptSass.parse(ScriptSass.lexer(ScriptSass.tokenize($(this).attr('style')),[],1,vars,mixins)));
				$(this).attr('style',code);
			});
		}
		dfd.resolve();
		return dfd.promise();
};
ScriptSass.load = function(file){
				var dfd = $.Deferred();
				var code="";
				$.ajax({
					url: file,
					success: function (response){
						code = response;
					},
					async: false
				});
				($('head').find('style').length > 0) ? $('head style').append(ScriptSass.compile(code)):$('head').append('<style>'+ScriptSass.compile(code)+'</style>');
				dfd.resolve();
				return dfd.promise();
};

ScriptSass.importSCSS = function(name){
				var filename = name.substring(name.lastIndexOf('/') + 1);
				filename = name.substring(0,name.lastIndexOf('/'))+"_"+filename+".sass";
				var code="";
				$.ajax({
					url: filename,
					success: function (response){
						code = response;
					},
					async: false
				});
				return ScriptSass.tokenize(code);
};

var example = ScriptSass.compile(' \
	@mixin $cool($v1){ \
		padding: $v1; \
	} \
	$b: .black; \
	$g: 1px solid green ; \
	$b:active{ \
		@include $cool(10px); \
		background-color: black; \
		&:hover{ \
			border: $g; \
		} \
	} \
	$map1: (pad: 10px, col: green);  \
	body{ \
		background-color: map-get($map1,col);\
	}'
	);
console.log("Printing out load");
console.log(example);
// Deliberately restricted expression parser. No eval, Function, imports or property access.
export function calculate(source, variables, output) {
  if(source.length>500) throw Error('Максимум 500 символов.');
  const clean=source.replace(/\/\/[^\n]*/g,'').trim();
  const match=clean.match(/^([a-zA-Z]+)\s*=\s*(.*?)\s*;?$/s);
  if(!match || match[1]!==output) throw Error(`Нужна одна строка: ${output} = выражение;`);
  const expr=match[2];
  const tokens=expr.match(/(?:\d*\.\d+|\d+\.?\d*)|[A-Za-z]+|[()+*/-]/g)||[];
  if(tokens.join('')!==expr.replace(/\s/g,'')) throw Error('Разрешены числа, имена входных величин, + − * / и скобки.');
  let pos=0;
  function atom(){const t=tokens[pos++]; if(t==='-' ) return -atom(); if(t==='+')return atom(); if(t==='('){const n=sum();if(tokens[pos++]!==')')throw Error('Не закрыта скобка.');return n;}if(t && /^\d|^\./.test(t))return Number(t);if(Object.hasOwn(variables,t))return variables[t];throw Error(`Неизвестное значение: ${t || 'конец строки'}`);}
  function product(){let n=atom();while(['*','/'].includes(tokens[pos])){const op=tokens[pos++],v=atom();n=op==='*'?n*v:n/v;}return n;}
  function sum(){let n=product();while(['+','-'].includes(tokens[pos])){const op=tokens[pos++],v=product();n=op==='+'?n+v:n-v;}return n;}
  const result=sum();if(pos!==tokens.length || !Number.isFinite(result))throw Error('Выражение не завершено или результат не конечен.');return result;
}
export function verify(lesson,source){const output=lesson.solution.split('=')[0].trim();return lesson.cases.map(values=>{const vars=Object.fromEntries(lesson.vars.map((key,i)=>[key,values[i]]));const expected=calculate(lesson.solution,vars,output),actual=calculate(source,vars,output);return {vars,expected,actual,pass:Math.abs(actual-expected)<1e-8*Math.max(1,Math.abs(expected))};});}

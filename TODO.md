Lists that do not depend on surrounding lists must be separated (server-side maybe?)

query parameters, attributes?
query result types, parameter types

spinner property
data reuse should show a spinner, if the query is slow

keys should contain the makumba row key, not 1,2,3
use javascript Proxy to generate data.line.name

remove JSON.stringify

/* to simplify the notation somewhat, we can define a function that returns a function ...*/
const list=(props)=> (f=><List {...props}>{f}</List>)

/* then we can call list(queryProperties) ( data=> use the data) */
const ShowTasks4= ({ forLine }) =>
  list({from:"Task t", where:`t.line=${forLine}`, separator: ", "})(
    data=> <OneTask days={data("t.days")} customer={data("t.customer")}/>
    )

/** and we can simplify even more */
const from=(from)=>{
   var ret= list({from});
  ret.where=(where)=>{
      var whr=list({from, where});
      whr.separator=(separator)=>list({from, where, separator});
      return whr;
  }
  ret.separator=(separator)=>list({from, separator});
   return ret;
}

const ShowTasks3= ({ forLine }) =>
  from("Task t").where(`t.line=${forLine}`).separator(", ")(
     data=> <b><OneTask days={data("t.days")} customer={data("t.customer")}/></b>
  )



Tutorial / motivation with Codepen inserts.

local use: npm install, npm run build

http:// without npm:
--------------------
loader.js
local file://  works but only in firefox where source mappings are not visible...

going beyond simple loader:
babel plugin:  transform-es2015-modules-amd
https://stackoverflow.com/questions/31593694/do-i-need-require-js-when-i-use-babel

withCredentials to authenticate to a path on the server
response.addHeader("Access-Control-Allow-Origin",request.getHeader("Origin"));
response.addHeader("Access-Control-Allow-Credentials", "true"); 

experimental code
-----------------
const ShowName = ({ who }) => <b><Value expr={who + '.name'} /></b>
const Test=()=><Consumer>{x=>x.resultData['line.name']}</Consumer>
const Bold=({text='bla',children })=><a href='text'>{children}</a>

passing data to lists inside?
<List from="Line l" tasks={from:"Task t" where:"t.line=line"} line="l" name="l.name">
   <Line>
       <List from="Task t" where="t.line=l" customer="t.customer">
            ({l, name})=><a href={`blabla${l}`}>{name}<Za>
           <Task/>
       </List>
   </Line>
</List>

Line=({line, name, children})=> <div><b>{name}</b>{children}</div>

SitePart=({a="ProductionLine"})=> 
<Row from="ProductionLine a" where={"a="+a}><List from="Task t where t.line=a">

----

Use of <List> in function???
can a list show up in iteration 2?

was my query executed?
execute
read prev query from context

----

-----
test bool && <List> -> should not generate a query
    bool does not matter when iteration begins!!! this can be used for routing.

if(bool)=>bool && children

<if(mak-bool)><List></if>
list generates query no matter what

----
lines.map(line =><Line>)

Line: 
line.getTasks().map(task=><Task>)

mapping Task.mdd => Task obj

mak("from ProductionLine l" ).each(({l, name})=><b>name</b>{
       mak("from Task t where t.line=l").each({t, customer})=><span><rectangle ....><label></span>
   }



ProductionDiagram=()=> <List from="Line l"><ProductionLine obj="l"></List>
ProductionLine:
<Value expr="{obj}.name"/>
<List from="Task t" where="t.line=line">
     <Task obj="t" base={param.base}/>
</List>

Task= (obj, base)=><rectangle mak-x={
  expr:`dateDiff(${obj}.startdate-$base)`,
  transform:x=>x/pixelsPerDay
  base:base
} 
mak-width=`{obj}.days` />
<label text="t.customer" mak-x=...> 

----
ProductionDiagramView= data=>data.map(row=><ProductionLineView props={row})
ProductionLineView= line= <div>{line.name}{line.tasks.map(task=><TaskView props={task)}}
TaskView ({startDate, days, customer}) <rectangle x={startDate} width={days}><label>{customer}</label>



makeContainer(
{
   from:"line l", 
   data:{
        line:{id, name}
        tasks:{
          from:"Task t",
          where="t.line=line",
          data={
             t:{ id, startDate, customer}
          }
        }  
});


ProductionDiagramView=(lines)=>
lines.map(line=><ProductionLineView props={line, tasks}>)

tasks.map(task => <TaskView props={task}>)

-----

offline data for debug-in-train purposes?

----- 
OQL parameters!!!

-----
data points
<List from="Line line, Task t where t.line=line">{({line, task})=>line.name()}<List>

---
Render props
https://reactjs.org/docs/render-props.html

-----
mix mak-enabled children with () => mak()...

components can use mak() directly?

TESTING
https://reactjs.org/docs/test-utils.html

{mak=>mak(x)} better because it doesn't have lateral effects?
https://reactjs.org/docs/react-component.html#render
render()
"it does not modify component state, 
it returns the same result each time it’s invoked, and 
it does not directly interact with the browser"



{ () => 
  <bla>{mak("list.name")}</bla>
  <List>{ ()=>
      blabla
  
  }</List>
}</List>

ShowName=({label})=>mak(label+".name")
assertType(label, makType)

two-way binding! 
<input mak-value= onChange> ? 
<input onChange={mak-sync('expr')}>
<input value={mak(expr, onChange... somehow}> 


If= props=> mak(props.test) && props.children

mak({from:blalba, where:blalba}, {nm:"line.name", "tasks":{from:"line.tasks"}, {cust:"line.customer"}})

some components make a separate query? maybe choose, so the first page of a portal will not create a huge query. but why not? all will update anyway?

components must instantiate all epressions in example mode!

how to best implement if?
const If=(test=true, tree)=> test && tree
<If mak-test="expr"  tree={...}>

return scalars (val()) and arrays
example values, annotated display

self-signed certificate with stackblitz 
- socat tcp-listen:8090,reuseaddr,fork tcp:sunset.nada.kth.se:8443
- this means that local development with a self-signed certificate (or even http?) works!

pagination

use with datatable, generate a data set somehow

test with ReactDOMServer, React Native

why react? components

React components that manipulate the DOM (e.g. datatable, bootstrap)
https://medium.com/@zbzzn/integrating-react-and-datatables-not-as-hard-as-advertised-f3364f395dfa
https://reactstrap.github.io/ (boostrap 4)
https://react-bootstrap.github.io/  (only bootstrap 3)



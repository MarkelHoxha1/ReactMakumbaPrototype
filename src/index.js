import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { List, Value, Backend, Mak } from './mak-react';
import './style.css';


/* The graphical scene is made out of Components which are basically Javascript classes or functions (we only use functions here). Many of them can be imported from other JS files, maximizing code reuse and code lisibility => more reliable code, easier for beginners to get the big picture.

Components are much more powerful than JSP includes, and React does components really well, much better than WebComponents for example.

Mixing HTML/React components with Javascript (JSX) is much more powerful than JSP because you can insert {Javascript} in HTML and then you can insert HTML in that Javascript and so on.

Look at the browser or stackblitz console to see the makumba queries and results. See the MDDs here
https://brfenergi.se/task-planner/mak-tools/dataDefinitions/

A few syntax notes:
<React.Fragment> is used because a single component tree must be returned from a JSX function
()=>x is the javascript arrow notation, it is mostly equivalent with function(){ return x}
*/


const App = () => 
  <React.Fragment>
    <List from="ProductionLine line">
      <div><Value expr="line.name" />: <ShowTasks forLine="line" /></div>
    </List>
    <hr />
    Park: <ShowTasks forLine="null" />
  </React.Fragment>

const Tbl = () =>
  <table>
    <tbody>
      <List from="Task t" >{data =>
        <tr>
          <td><input value={data("t.customer")} /></td>
          <td><input value={data("t.days")} /></td>
          <td><select value={data("t.line")} >
             <option value="">choose</option>
            <List from="ProductionLine lin">{ data=>
              <option value={data("lin")}>{data("lin.name")}</option>
            }</List>
          </select>
          </td></tr>
      }</List>
    </tbody>
  </table>

const Both=()=><React.Fragment><App/><hr/><Tbl/></React.Fragment>

/* A component used by the main app component. Notes:
0) the parameter list ({forLine}) is standard javascript notation, albeit a bit cryptical. It means that there will be one single parameter, with a property called forLine. In general, there can be many such parameters, with many properties: ({a,b,c}, {d, e})

1) you can use a variable makumba query, e.g. where="{javascript_expr}". Such expressions are evaluated before passing to makumba so they can be used just about anywhere (<Value expr>, etc). This is much more powerful than in JSP
1.1) where={"t.line="+forLine}  works as well. The backtick notation `text${javascript expr}text` is standard javascript

2) ShowTask renders every task with a special component called OneTask and it needs to set properties to it. To pass a makumba value to any component property (or to use it anywhere else in javascript), you can use <Mak>{evaluator=>jsx-expression}</Mak>. The evaluator is passed by Makumba and it can evaluate any OQL expression. We usually call this paramter "data", but it can be called anything. So 
<Value expr="expression" /> is equivalent with 
<Mak>{data=>data("expression")}</Mak>

You may wonder why a function is needed inside <Mak>, why not just the jsx-expression. The reason is that, unlike in JSP, the JSX inside <List> is evaluated before the <List> itself. Passing a function will delay the evaluation until the rendering phase.
*/
const ShowTasks = ({ forLine }) => 
  <List from="Task task" where={`task.line=${forLine}`} separator=", ">
    <Mak>{data => <OneTask days={data("task.days")} customer={data("task.customer")} />}</Mak>
  </List>

/* You can use the above data=>JSX technique also for the whole List tag and then you don't need to specify <Mak>. Note that in this case the only child of the List must be the data=>JSX function. <Mak>  is still useful when you don't have a surrounding <List>, e.g. in a component which you invoke from within a <List>
*/
const ShowTasks1 = ({ forLine }) => <span>
  <List from="Task task" where={`task.line=${forLine}`} separator=", ">{data =>
    <OneTask days={data("task.days")} customer={data("task.customer")} />
  }</List>
</span>

/* Example of React "presentation component", that knows nothing about makumba or any other way of getting data, it just does presentation.
  This means that you can connect makumba to just about any javascript library that works with React. Since React is widely supported (and you can even connect React to libraries unaware of it), there is a lot of potential here. 
  It is possible to detect that OneTask expects a 'customer' property, so makumba can look for a MDD field or MDD function() called "customer", so maybe the makumba programmer will not need to indicate any properties when using the component, like <Mak populate=OneTask />
   We can decide together if such features are useful.
*/

const OneTask = ({ customer, days }) => <i>{customer}:{days}</i>

/*
The recompose library can help us aboiding to create a new class. There are many libraries you can use with React!
const OneTask=pure(({customer, days})=><i>{customer}:{days}</i>)
*/

// ---- bootstraping the application and connection to the makumba server -----


/* a HTTPS server is needed here because stackblitz is served via https. 
  I configured https in a domain I have but it really points to 
  http://sunset.nada.kth.se:8080/mak-backend/MakumbaQueryServlet

  Another view of the same data, using a pure js library (non-react) which features drag-and-drop interaction. Such interaction should also be possible in makumba-react.
  http://sunset.nada.kth.se:8080/mak-backend/html/test-tasks.html
  */
const URL = 
"https://brfenergi.se/task-planner/MakumbaQueryServlet"

/* or you can use HTTP on localhost for offline development (node.js or file:// ) or even with a stackblitz pre-loaded in your browser) 
*/
//const URL="http://localhost:8080/mak-backend/MakumbaQueryServlet"

const TaskApp=()=><Backend server={URL}>
    <Router>
    <div>
      <ul>
        <li><Link to="/">Diagram</Link></li>
        <li><Link to="/table">Table</Link></li>
        <li><Link to="/both">Both</Link></li>
      </ul>
      <hr />
      <Route exact path="/" component={App} />
      <Route path="/table" component={Tbl} />
      <Route path="/both" component={Both} />
    </div>
  </Router>
  </Backend>

const QueueApp=()=>
<Backend server="https://brfenergi.se/lab-queue/MakumbaQueryServlet">
<List from="q.Queue qu">{d=>
  <div><div>{d("qu.course")}</div>
        <List from="q.Wait w" where="w.queue=qu">
          <li><Value expr="w.user.name"/> <Value expr="w.TS_create"/></li>
        </List></div>
  }</List></Backend>



// A BEST related app
const BESTApp=()=><Backend server="https://stage.best.eu.org/tests_for_mak_react/MakumbaQueryServlet">
     <List from="best.internal.Lbg l" separator=", ">{data=>data("l.name")}</List>
  </Backend>


render(
  <TaskApp/>,
  document.getElementById('root'));

// important: yout HTML can contain more than just a DIV! It may be a pre-rendered version of your app, rendered with React at the server side.

/*
That's it. You should be able to sketch a new makumba interface using Stackblitz, CodePen, a local node.js (press Export, unpack the zip, cd to the unpacked folder and type "npm start"). Also, you can use file:// with Firefox or a simple http server (Chrome does not load local javascript via file ://). See the local-devel/ folder in tbis project

Whichever tool you use, you can connect your makumba interface to your makumba backend server as above. You may wonder: "can anybody access my data from a CodePen or file:// ???" 

The answer is: This example serves data from public parts of the server. There will be a new tag 
<Realm path="some/path" > <List ...></Realm> that will execute checkAttributes() on that path so all <List>s inside the Realm will have the needed credentials. The moment you try to access a protected resource, the backend server responds with a HTTP 401 and that will prompt basic authentication in the browser (it can be possible to plug-in a login interface so you can show some HTML instead of the standard browser login dialog)

The public server parts must be limited to the relevant MDDs and fields. There will be mechanisms for that.

Also, if the path "" has checkAttributes(), nobody will be able to access any data from the makumba server unless they login.
*/


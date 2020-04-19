import React, { Component } from 'react';

const API = 'https://brfenergi.se/task-planner/MakumbaQueryServlet';

class FetchApproach extends Component {
  constructor(props) {
    super(props);

    this.state = {
      responseFromServer: [],
      isLoading: false,
      error: null,
    };
  }

  controlFromClause(query){
      var querySection = '';
      var obj = new Object();
      if(query.indexOf("from") !== -1)
      {
        querySection = query.substr(query.indexOf("from") + 5, query.indexOf(")") - 5);
        obj.querySections = [];
        obj.querySections.push(querySection);
        obj.querySections.push(this.controlWhereClause(query.substr(query.indexOf(")") + 2)));
      }
      return obj;

  }

  returnFromClause(query){
    return query.substr(query.indexOf("from") + 6, query.indexOf(")") - 6);
  }

  controlWhereClause(query){
    var queryWhereSection = '';
    if(query.indexOf("where") !== -1)
    {
      queryWhereSection = query.substr(6, query.indexOf(")") - 5);
      return queryWhereSection;
    }
    else
    return "1 == 1";
  }

  processQuery(query)
  {
    // control 'From' word
    // control 'Where' word
    // control 'map' word if yes create new object
    // switch(word)
    // {
    //   case "from": 
    //   //operation 
    //   break;
    // }
    var arrayToBeReturned = [];
    var querySplitted = query.split('.map'); //splitting by map
    querySplitted.map((element)=>{
      if(element.indexOf("from") !== -1) {
        this.returnFromClause(element); //interpreting from clause
      }
      this.controlFromClause(element);
    });
    return [
        {
          projections: ["line.name"],
          querySections: ["ProductionLine line", "1 = 1", null, null, null, null, null],
          parentIndex: -1,
          limit: -1,
          offset: 0
         },
        {
          projections: ["task.days", "task.customer","task.endDate", "task.startDate"],
          querySections: ["Task task", "task.line=line", null, null, null, null, null],
          parentIndex: 0,
          limit: -1,
          offset: 0
        }];
  }

  escapeRegExp(string) {
    return string.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(\<![\-\-\s\w\>\/]*\>)/g, ' '); // $& means the whole matched string
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    // var dataToBeSent = [{
    //     projections: ["c.name"],
    //     querySections: ["Courses c", undefined, null, null, null, null, null],
    //     parentIndex: -1,
    //     limit: -1,
    //     offset: 0
    // }];
    var query = 'from("ProductionLine line").where("1 == 1").map( data=> ( /*expression*/ { /*new object */ '+
      'name: data("line.name"), // object { key1:value1, key2, value2}' + 
      'students: data.from("line.Task task").map(data=> ({name: data("task.days"), '+
      'grade: data("task.customer"), courseNumber: data("task.endDate")}) })  // end of object and expression )// end of map()';
    

    // var dataToBeSent = [
    //   {
    //     projections: ["line.name"],
    //     querySections: ["ProductionLine line", "1 = 1", null, null, null, null, null],
    //     parentIndex: -1,
    //     limit: -1,
    //     offset: 0
    //    },
    //   {
    //     projections: ["task.days", "task.customer","task.endDate"],
    //     querySections: ["Task task", "task.line=line", null, null, null, null, null],
    //     parentIndex: 0,
    //     limit: -1,
    //     offset: 0
    //   }];
    query = this.escapeRegExp(query);

    console.log("Query after removing comments => "+ query);
    
    var dataToBeSent = this.processQuery(query);

    fetch(API, {
        method: "POST",
        credentials: 'include',
        body: "request=" + encodeURIComponent(JSON.stringify({ queries: dataToBeSent })) + "&analyzeOnly=false"
      })
      .then(response => {
          console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(data =>{
        console.log(data.resultData);
        this.setState({ responseFromServer: data.resultData, isLoading: false });
      } )
      .catch(error =>
        {
          console.log(error);
          this.setState({ error, isLoading: false })
        });
  }

  render() {
    const { responseFromServer, isLoading, error } = this.state;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Loading ...</p>;
    }
    return (
      <p>
        { 'Success'
        /* {   Object.keys(responseFromServer[0]).forEach(key => 
              // Object.keys(responseFromServer[0][key]).forEach(keyInside => 
                
                     <p>{key}</p> 
                
            ) */
          }
      </p>
    );
  }
}

export default FetchApproach;
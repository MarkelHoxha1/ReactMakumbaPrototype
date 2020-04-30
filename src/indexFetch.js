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

  getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

  returnFromClause(query){
    return query.substr(query.indexOf("(") + 2, query.indexOf(")") - 3);
  }

  returnWhereClause(query){
    var queryWhereSection = '';
    if(query.indexOf("where") !== -1)
    {
      queryWhereSection = query.substr(query.indexOf("(") + 2, query.indexOf(")") - 8);
      return queryWhereSection;
    }
    else
    return "1 == 1";
  }

  returnSelectClause(query)
  {
    var keywordSearching = '';
    var stringContainsMapAndKeyWord = query.substr(0, query.indexOf("=>"));
    stringContainsMapAndKeyWord = stringContainsMapAndKeyWord.replace(/\s/g,'');
    keywordSearching = stringContainsMapAndKeyWord.substr(stringContainsMapAndKeyWord.indexOf("(") + 1);
    var arrayProjections = [];
    var indexes = this.getIndicesOf(keywordSearching + "(", query);

    for(var i of indexes)
    {
      arrayProjections.push(this.processMapKeyword(query, i));
    }
    return arrayProjections;
  }

  processMapKeyword(query, index)
  {
    query = query.substr(index);
    return query.substring( 6, query.indexOf(")") - 1);
  }

  processQuery(query)
  {
    var index = -1;
    var arrayToBeReturned = [];
    var queryWithoutWherePart = '';
    //var querySplitted = query.split('.map'); //splitting by map
    var querySplittedFrom = query.split('from');
    querySplittedFrom.map((element)=>{
      if(element !== '') {
        var fromClause = this.returnFromClause(element); //interpreting from clause
        //process from Clause if is formed with . 
        var queryWithoutFromPart = element.substr(element.indexOf(")") + 2);
        var whereClause = this.returnWhereClause(queryWithoutFromPart);
        if(queryWithoutFromPart.indexOf("where") !== -1){
          queryWithoutWherePart = queryWithoutFromPart.substr(queryWithoutFromPart.indexOf(")") + 2);
        }
        else{
          queryWithoutWherePart = queryWithoutFromPart;
        }
        
        var selectClause = this.returnSelectClause(queryWithoutWherePart);
        arrayToBeReturned.push({
          projections: selectClause,
          querySections: [fromClause, whereClause, null,null,null,null, null],
          parentIndex: index,
          limit: -1,
          offset: 0
        });
        index++;
      }
    });

     //replace from and where clause
     for(var element of arrayToBeReturned)
     {
        if(element.querySections[0].indexOf('.') !== -1)
        {
          //was line.Task task
          var newObject = element.querySections[0].split(' ')[1]; //task
          var newProperty = element.querySections[0].split('.')[0]; //line
          element.querySections[0] = element.querySections[0].split('.')[1]; //Task task
          element.querySections[1] = newObject+'.'+ newProperty +'='+newProperty;
          //now is Task task , task.line = line
        }
     }
  return arrayToBeReturned;
    // return [
    //     {
    //       projections: ["line.name"],
    //       querySections: ["ProductionLine line", "1 = 1", null, null, null, null, null],
    //       parentIndex: -1,
    //       limit: -1,
    //       offset: 0
    //      },
    //     {
    //       projections: ["task.days", "task.customer","task.endDate", "task.startDate"],
    //       querySections: ["Task task", "task.line=line", null, null, null, null, null],
    //       parentIndex: 0,
    //       limit: -1,
    //       offset: 0
    //     }];
  }

  escapeRegExp(string) {
    return string.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(\<![\-\-\s\w\>\/]*\>)/g, ' '); // $& means the whole matched string
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    var query = 'from("ProductionLine line").where("1 = 1").map( data=> ( /*expression*/ { /*new object */ '+
      'name: data("line.name"), // object { key1:value1, key2, value2}' + 
      'students: data.from("line.Task task").map(data=> ({name: data("task.days"), '+
      'grade: data("task.customer"), courseNumber: data("task.endDate"), test: data("task.startDate")}) })  // end of object and expression )// end of map()';
    

    query = this.escapeRegExp(query);

    console.log("Query after removing comments => "+ query);
    
    var dataReturned = this.processQuery(query);

    // console.log(dataToBeSent);
     console.log(dataReturned);

    fetch(API, {
        method: "POST",
        credentials: 'include',
        body: "request=" + encodeURIComponent(JSON.stringify({ queries: dataReturned })) + "&analyzeOnly=false"
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
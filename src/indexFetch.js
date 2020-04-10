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

  processQuery(query)
  {
    return new Object();
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
    var query = 'from("Courses c").where("c=$course").map( data=> ( /*expression*/ { /*new object */ '+
      'name: data("c.name"), // object { key1:value1, key2, value2}' + 
      'students: data.from("c.students s").map(data=> ({name: data("s.name"), '+
      'grade: data("s.grade"), courseNumber: data("c.number")}) })  // end of object and expression )// end of map()';
    
    query = this.escapeRegExp(query);

    console.log("Query after removing comments => "+ query);
    
    var dataToBeSent = this.processQuery();

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
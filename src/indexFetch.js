import React, {Component} from 'react';

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

  processQuery(query) {
    // control 'From' word
    // control 'Where' word
    // control 'map' word if yes create new object
    // switch(word)
    // {
    //   case "from":
    //   //operation
    //   break;
    // }
    return [
      {
        projections: ['line.name'],
        querySections: [
          'ProductionLine line',
          '1 = 1',
          null,
          null,
          null,
          null,
          null,
        ],
        parentIndex: -1,
        limit: -1,
        offset: 0,
      },
      {
        projections: [
          'task.days',
          'task.customer',
          'task.endDate',
          'task.startDate',
        ],
        querySections: [
          'Task task',
          'task.line=line',
          null,
          null,
          null,
          null,
          null,
        ],
        parentIndex: 0,
        limit: -1,
        offset: 0,
      },
    ];
  }

  escapeRegExp(string) {
    return string.replace(
      /(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(\<![\-\-\s\w\>\/]*\>)/g,
      ' ',
    ); // $& means the whole matched string
  }

  componentDidMount() {
    this.setState({isLoading: true});

    // var dataToBeSent = [{
    //     projections: ["c.name"],
    //     querySections: ["Courses c", undefined, null, null, null, null, null],
    //     parentIndex: -1,
    //     limit: -1,
    //     offset: 0
    // }];
    var query =
      'from("ProductionLine line").where("1 == 1").map( data=> ( /*expression*/ { /*new object */ ' +
      'name: data("line.name"), // object { key1:value1, key2, value2}' +
      'students: data.from("line.Task task").map(data=> ({name: data("task.days"), ' +
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

    console.log('Query after removing comments => ' + query);

    var dataToBeSent = this.processQuery();

    const fetchData = async () => {
      try {
        const response = await fetch(API, {
          method: 'POST',
          credentials: 'include',
          body:
            'request=' +
            encodeURIComponent(JSON.stringify({queries: dataToBeSent})) +
            '&analyzeOnly=false',
        });
        console.log(response);
        const data = await response.json();
        console.log(data.resultData);
        this.setState({
          responseFromServer: data.resultData,
          isLoading: false,
        });
      } catch (error) {
        console.log(error);
        this.setState({error, isLoading: false});
      }
    };
    fetchData();
  }

  render() {
    const {responseFromServer, isLoading, error} = this.state;

    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Loading ...</p>;
    }
    return (
      <p>
        {
          'Success'
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

import React from 'react';

export const { Provider, Consumer } = React.createContext()

export const Mak = ({ children }) => React.createElement(Consumer, null, data => children(data.eval))

export class Backend extends React.Component {
  i = 0;
  cache={}
  componentDidMount() {
    //setInterval(()=>this.setState({}), 5000);
  }
  render() {
    console.log("backend " + this.i);
    return React.createElement(
      Provider,
      { value: { server: this.props.server, cache:this.cache, tick: this.i++ } },
      this.props.children);
  }
}

export class List extends React.Component {
  componentDidMount() {
    //console.log("m "+this.props.from)
    //console.log(this.queries)
    if (this.queries){
      this.makdata=this.cache[JSON.stringify(this.queries)];
      if(!this.makdata)
        this.setState({ hide: true })
      else{
         console.log("data reuse")
         //console.log(this.makdata)
         this.setState({ cachedData:true})  
      }
    }
    this.recheck();
  }
  componentDidUpdate() {
    if (this.state && this.state.hide)
      return;
    this.recheck();
    //if (this.tags)
    //setTimeout(() => this.runQueries(), 5000)
  }

  componentWillUnmount() {
    // console.log("unmount " + this.props.from)
  }
  recheck() {
    if (this.dirty())
      if (!this.queries)
        this.setState({})
      else
        this.runQueries()
  }
  dirty() { return JSON.stringify(this.queries) != JSON.stringify(this.oldQueries) }

  render() {
    if (this.state && this.state.hide) {
      //console.log("hiding")
      return false;
    }

    return React.createElement(
      Consumer,
      null,
      data => {
        let root = data.root;
        let resultData = data.resultData;
        let cachedData= data.cachedData;

        if (!data.parent) {
          //console.log("consume:"+this.props.from + " "+this.tick)
          cachedData= this.state&& this.state.cachedData;
          this.server = data.server;
          this.cache=data.cache;
          this.oldQueries = this.queries || [];
          this.queries = [...this.oldQueries];
          this.tags = this.tags || [];
          root = this;
          if(this.makdata && this.makdata.error)
             return this.makdata.error;
          resultData = this.makdata && this.makdata.resultData;
          if (resultData && this.tick != data.tick) {
            this.runQueries();
          }
          this.tick = data.tick;

        }
        this.queryIndex = root.addQuery(this, data.parent);


        // console.log("r:"+this.props.from+ "  "+root.dirty()+" "+this.queryIndex)
        return ((root.dirty() || !resultData) ? [undefined] : resultData["" + this.queryIndex]).map((obj, i) => {
          let rd = root.dirty() ? [undefined] : this.enrich(resultData, obj, this.queryIndex);
          let eva = (expr) => { root.addProjection(expr, this); return rd[expr] || ""; }
          let provided = {
            value: {
              cachedData,
              resultData: rd,
              parent: this,
              root,
              eval: eva,
            },
            key: i
          };

          let chd = (typeof (this.props.children) == 'function') ?
            this.props.children(eva) :
            this.props.children;

          return (i > 0 && this.props.separator) ?
            React.createElement(Provider, provided, this.props.separator, chd) :
            React.createElement(Provider, provided, chd);

        }
        )
      }
    )
  }

  indexAndAdd(arr, q) {
    for (let i = 0; i < arr.length; i++)
      if (arr[i] == q || arr[i].props && arr[i].props.from == q.props.from
        && arr[i].props.where == q.props.where) {
        return i;
      }
    //if(q.props)console.log("not found "+q.props.from+ "  "+i)  
    arr.push(q);
    return -1;
  }

  addQuery(q, parent) {
    if (q.queryIndex)
      return q.queryIndex;
    let ret = this.indexAndAdd(this.tags, q);
    if (ret != -1)
      return ret;
    ret = this.tags.length - 1;
    this.queries[ret] = {
      projections: [],
      querySections: [q.props.from, q.props.where, null, null, null, null, null],
      parentIndex: parent ? parent.queryIndex : -1,
      limit: -1,
      offset: 0,
    }
    return ret;
  }

  addProjection(expr, parent) {
    //console.log(expr+" "+parent.props.from+" "+parent.queryIndex)
    return this.indexAndAdd(this.queries[parent.queryIndex].projections, expr)
  }


  runQueries() {
    console.log(this.queries)
    fetch(this.server, {
      method: "POST",
      credentials: 'include',
      body: "request=" + encodeURIComponent(JSON.stringify({ queries: this.queries })) + "&analyzeOnly=false"
    }).then(response =>  response.json())
      .then(data => {
        console.log(data)
        this.makdata = data;
        this.cache[JSON.stringify(this.queries)]=data

      //if (this.state.hide) {
          //console.log("showing")
          this.setState({ hide: false , cachedData:false})
      //}
      })
      .catch(e => console.error(e))
  }

  /*
    decorateChildren(children, rd, obj, root) {
      if(typeof(children)=='function')
          return children( expr=> {root.addProjection(expr, this);	return rd[expr]||"pending";});
      
      return React.Children.map(children, child => {
        
        if (child == null)
          return child;
        if (child.type == List  || child.type==Mak|| !child.props)
          return child
        //if(typeof(child)=='function')
  
        let prps = {};
        Object.keys(child.props).map(k => {
          if (k.startsWith('mak-')) {
            if (root.addProjection(child.props[k], this) != -1)
              prps[k.substring(4)] = obj[child.props[k]]
            else
              prps[k.substring(4)] = "pending"
          }
        })
  
        //console.log(child.type)
        //console.log(child.props)
        //console.log(prps)
  
        return React.cloneElement(child, prps, this.decorateChildren(child.props.children, rd, obj))
      })
    }
    */

  enrich(data, obj, queryId) {
    Object.keys(data).map(k => {
      if (k != '' + queryId) { obj[k] = data[k] }
    });
    return obj;
  }
}

export const Value = ({ expr }) =>
  React.createElement(Mak, null, data => data(expr))

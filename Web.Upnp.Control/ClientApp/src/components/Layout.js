import React from "react"
import NavBar from "./navigation/NavBar"

export default class Layout extends React.Component {

    displayName = Layout.name;

    render() {
        return <div className="container-fluid p-0">
                   <div className="row no-gutters">
                       <div className="col-auto">
                           <NavBar/>
                       </div>
                       <main className="col py-3 px-3">
                           {this.props.children}
                       </main>
                   </div>
               </div>;
    }
}
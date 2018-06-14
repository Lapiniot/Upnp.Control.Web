import React from 'react'
import NavBar from './NavBar'

export default class Layout extends React.Component {
    displayName = Layout.name;

    render() {
        return (
            <div class="container-fluid p-0">
                <div class="row no-gutters">
                    <div class="col-auto">
                        <NavBar/>
                    </div>
                    <main class="col py-3 px-3">
                        {this.props.children}
                    </main>
                </div>
            </div>
        );
    }
}
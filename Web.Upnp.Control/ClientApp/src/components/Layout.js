import React, { Component } from 'react'
import { NavBar } from './NavBar'

export class Layout extends Component {
    displayName = Layout.name;

    render() {
        return (
            <div class="container-fluid">
                <div class="row no-gutters">
                    <div class="col-auto mr-auto">
                        <NavBar/>
                    </div>
                    <main class="col">
                        {this.props.children}
                    </main>
                </div>
            </div>
        );
    }
}
import React, { Component } from 'react'
import { NavBar } from './NavBar'

export class Layout extends Component {
    displayName = Layout.name;

    render() {
        return (
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-1">
                        <NavBar/>
                    </div>
                    <div class="col-lg-11">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
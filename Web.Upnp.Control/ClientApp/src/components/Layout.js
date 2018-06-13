import React from 'react'
import { NavBar } from './NavBar'

export class Layout extends React.Component {
    displayName = Layout.name;

    render() {
        return (
            <div class="container-fluid">
                <div class="row">
                    <div class="col-auto">
                        <NavBar/>
                    </div>
                    <main class="col py-2 px-0">
                        {this.props.children}
                    </main>
                </div>
            </div>
        );
    }
}
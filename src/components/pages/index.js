import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import AppList from '../list';
import AppDetail from '../detail';
import AppLog from '../log';
import AppJob from '../job';

class Pages extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path="/list" component={AppList} />
                <Route path="/jobs" component={AppJob} />
                <Route path="/detail" component={AppDetail} />
                <Route path="/logger" component={AppLog} />
                <Redirect from="/" to="/list" />
            </Switch>
        )
    }
}

export default Pages
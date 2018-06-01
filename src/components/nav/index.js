import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';

import './index.css';

const breadcrumbNameMap = {
    '/detail': '详情页',
    '/logger': '日志',
};

const Nav = withRouter((props) => {
    const { location } = props;
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>
                    {breadcrumbNameMap[url]}
                </Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = [(
        <Breadcrumb.Item key="home">
            <Link to="/">主页</Link>
        </Breadcrumb.Item>
    )].concat(extraBreadcrumbItems);

    return (
        <div className="navStyle">
            <Breadcrumb>
                {breadcrumbItems}
            </Breadcrumb>
        </div>
    )
});

export default Nav;
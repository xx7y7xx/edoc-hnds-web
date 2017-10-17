import React from 'react'
import Topbar from '../../components/topBar/Topbar'
import { Title } from '../../components/Title'

const content = (
    <div>这是个档案查询，爱信不信！！</div>
);

export default class Report extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Topbar />
                <div className="main-content main-content-animate">
                    { Title() }
                    { content }
                </div>
            </div>
        )
    }
}
import React from 'react'
import Topbar from '../../components/topBar/Topbar'
import { Title } from '../../components/Title'
const content = (
    <div>这是个高级查询，爱信不信！！</div>
);



export default class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ''
        }
    }

    currentSearch = () => {
        console.log(this.state.keyword)
    }

    keywordChange = (e) => {
        this.setState({keyword: e.target.value});
    }

    render() {
        return (
            <div>
                <Topbar currentSearch={this.currentSearch} keywordChange={this.keywordChange}/>
                <div className="main-content main-content-animate">
                    { Title() }
                    { content }
                </div>
            </div>
        )
    }
}
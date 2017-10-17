import { useRouterHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'

export const browserHistory = useRouterHistory(createBrowserHistory)({
    basename: '/'
});

export default browserHistory